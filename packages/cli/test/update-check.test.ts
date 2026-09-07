import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { readPackageInfo } from '../src/package-info.js';
import {
    checkForUpdate,
    dismissUpdatesForToday,
} from '../src/update-check.js';
import {
    getNpxExecutable,
    handleUpdateNotification,
} from '../src/update-notifier.js';

async function withCacheFile(
    assertion: (cachePath: string) => Promise<void>,
): Promise<void> {
    const tempDir = await mkdtemp(
        path.join(os.tmpdir(), 'nestforge-update-'),
    );

    try {
        await assertion(path.join(tempDir, 'update-check.json'));
    } finally {
        await rm(tempDir, { recursive: true, force: true });
    }
}

function registryResponse(version: string): typeof fetch {
    return async () => new Response(
        JSON.stringify({ version }),
        {
            status: 200,
            headers: { 'content-type': 'application/json' },
        },
    );
}

test('reads the current CLI package name and version', async () => {
    const packageInfo = await readPackageInfo();

    assert.equal(packageInfo.name, 'nestforge-generator');
    assert.match(packageInfo.version, /^\d+\.\d+\.\d+/);
});

test('detects a newer stable version from the npm registry', async () => {
    await withCacheFile(async (cachePath) => {
        const update = await checkForUpdate('0.4.1', {
            cachePath,
            fetchImplementation: registryResponse('0.5.0'),
            now: Date.UTC(2026, 8, 7, 12),
        });

        assert.deepEqual(update, {
            currentVersion: '0.4.1',
            latestVersion: '0.5.0',
        });
    });
});

test('does not offer an update when the installed version is current', async () => {
    await withCacheFile(async (cachePath) => {
        const update = await checkForUpdate('0.5.0', {
            cachePath,
            fetchImplementation: registryResponse('0.5.0'),
        });

        assert.equal(update, null);
    });
});

test('reuses fresh registry metadata from the local cache', async () => {
    await withCacheFile(async (cachePath) => {
        const now = Date.UTC(2026, 8, 7, 12);
        let requests = 0;
        const fetchImplementation: typeof fetch = async () => {
            requests += 1;
            return new Response(
                JSON.stringify({ version: '0.5.0' }),
                { status: 200 },
            );
        };

        await checkForUpdate('0.4.1', {
            cachePath,
            fetchImplementation,
            now,
        });
        const cachedUpdate = await checkForUpdate('0.4.1', {
            cachePath,
            fetchImplementation,
            now: now + 60_000,
        });

        assert.equal(requests, 1);
        assert.equal(cachedUpdate?.latestVersion, '0.5.0');
    });
});

test('silently continues when the registry is unavailable', async () => {
    await withCacheFile(async (cachePath) => {
        const update = await checkForUpdate('0.4.1', {
            cachePath,
            fetchImplementation: async () => {
                throw new Error('offline');
            },
        });

        assert.equal(update, null);
    });
});

test('suppresses update reminders until the next local day', async () => {
    await withCacheFile(async (cachePath) => {
        const now = new Date(2026, 8, 7, 14, 30).getTime();
        await dismissUpdatesForToday({ cachePath, now });

        const cache = JSON.parse(
            await readFile(cachePath, 'utf8'),
        ) as { dismissedUntil: number };
        const update = await checkForUpdate('0.4.1', {
            cachePath,
            fetchImplementation: registryResponse('0.5.0'),
            now: now + 60_000,
        });

        assert.equal(
            cache.dismissedUntil,
            new Date(2026, 8, 8, 0, 0).getTime(),
        );
        assert.equal(update, null);
    });
});

test('updates and restarts when the user accepts the update', async () => {
    let startedLatestVersion = false;

    const result = await handleUpdateNotification({
        readCurrentPackage: async () => ({
            name: 'nestforge-generator',
            version: '0.4.1',
        }),
        check: async () => ({
            currentVersion: '0.4.1',
            latestVersion: '0.5.0',
        }),
        prompt: async () => 'update',
        runLatest: async () => {
            startedLatestVersion = true;
            return true;
        },
    });

    assert.equal(startedLatestVersion, true);
    assert.equal(result, 'restarted');
});

test('continues with the installed version when the user declines', async () => {
    let startedLatestVersion = false;

    const result = await handleUpdateNotification({
        readCurrentPackage: async () => ({
            name: 'nestforge-generator',
            version: '0.4.1',
        }),
        check: async () => ({
            currentVersion: '0.4.1',
            latestVersion: '0.5.0',
        }),
        prompt: async () => 'continue',
        runLatest: async () => {
            startedLatestVersion = true;
            return true;
        },
    });

    assert.equal(startedLatestVersion, false);
    assert.equal(result, 'continue');
});

test('stores the dismissal when the user asks not to be reminded today', async () => {
    let dismissed = false;

    const result = await handleUpdateNotification({
        readCurrentPackage: async () => ({
            name: 'nestforge-generator',
            version: '0.4.1',
        }),
        check: async () => ({
            currentVersion: '0.4.1',
            latestVersion: '0.5.0',
        }),
        prompt: async () => 'dismiss-today',
        dismiss: async () => {
            dismissed = true;
        },
    });

    assert.equal(dismissed, true);
    assert.equal(result, 'continue');
});

test('uses the platform-specific npx executable', () => {
    assert.equal(getNpxExecutable('win32'), 'npx.cmd');
    assert.equal(getNpxExecutable('linux'), 'npx');
    assert.equal(getNpxExecutable('darwin'), 'npx');
});
