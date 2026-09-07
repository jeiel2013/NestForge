import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import semver from 'semver';

const REGISTRY_URL =
    'https://registry.npmjs.org/nestforge-generator/latest';
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 2_000;

interface UpdateCache {
    checkedAt?: number;
    latestVersion?: string;
    dismissedUntil?: number;
}

export interface UpdateInfo {
    currentVersion: string;
    latestVersion: string;
}

export interface UpdateCheckOptions {
    cachePath?: string;
    fetchImplementation?: typeof fetch;
    now?: number;
}

export function getUpdateCachePath(): string {
    return path.join(
        os.homedir(),
        '.nestforge',
        'update-check.json',
    );
}

async function readCache(cachePath: string): Promise<UpdateCache> {
    try {
        const cache = (await fs.readJson(cachePath)) as UpdateCache;
        return cache && typeof cache === 'object' ? cache : {};
    } catch {
        return {};
    }
}

async function writeCache(
    cachePath: string,
    cache: UpdateCache,
): Promise<void> {
    await fs.outputJson(cachePath, cache, { spaces: 2 });
}

async function fetchLatestVersion(
    fetchImplementation: typeof fetch,
): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
    );

    try {
        const response = await fetchImplementation(REGISTRY_URL, {
            headers: {
                accept: 'application/json',
            },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(
                `The npm registry returned ${response.status}.`,
            );
        }

        const metadata = (await response.json()) as {
            version?: unknown;
        };

        if (
            typeof metadata.version !== 'string' ||
            !semver.valid(metadata.version)
        ) {
            throw new Error(
                'The npm registry returned an invalid version.',
            );
        }

        return metadata.version;
    } finally {
        clearTimeout(timeout);
    }
}

export async function checkForUpdate(
    currentVersion: string,
    options: UpdateCheckOptions = {},
): Promise<UpdateInfo | null> {
    if (!semver.valid(currentVersion)) {
        return null;
    }

    const now = options.now ?? Date.now();
    const cachePath = options.cachePath ?? getUpdateCachePath();

    try {
        const cache = await readCache(cachePath);

        if (
            typeof cache.dismissedUntil === 'number' &&
            cache.dismissedUntil > now
        ) {
            return null;
        }

        const hasFreshCache =
            typeof cache.checkedAt === 'number' &&
            typeof cache.latestVersion === 'string' &&
            now - cache.checkedAt < CHECK_INTERVAL_MS &&
            semver.valid(cache.latestVersion);

        const latestVersion = hasFreshCache
            ? cache.latestVersion!
            : await fetchLatestVersion(
                options.fetchImplementation ?? fetch,
            );

        if (!hasFreshCache) {
            try {
                await writeCache(cachePath, {
                    ...cache,
                    checkedAt: now,
                    latestVersion,
                });
            } catch {
                // The update can still be offered without a writable cache.
            }
        }

        return semver.gt(latestVersion, currentVersion)
            ? { currentVersion, latestVersion }
            : null;
    } catch {
        return null;
    }
}

export async function dismissUpdatesForToday(
    options: Pick<UpdateCheckOptions, 'cachePath' | 'now'> = {},
): Promise<void> {
    const now = options.now ?? Date.now();
    const cachePath = options.cachePath ?? getUpdateCachePath();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);

    try {
        const cache = await readCache(cachePath);
        await writeCache(cachePath, {
            ...cache,
            dismissedUntil: tomorrow.getTime(),
        });
    } catch {
        // A cache failure must never prevent the CLI from starting.
    }
}
