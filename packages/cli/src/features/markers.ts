import fs from 'fs-extra';
import path from 'node:path';

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage']);

// If the first non-empty line matches, the entire file belongs to a feature.
// Accepts "//" (TS/JS) and "#" (YAML/.env) as comment prefixes.
const FILE_MARKER = /^(?:\/\/|#) nestforge:feature-file:(\S+)\s*$/;

// Marks the start/end of a block inside a file (one or multiple lines).
const BLOCK_START = /^(\s*)(?:\/\/|#) nestforge:feature:(\S+)\s*$/;
const BLOCK_END = /^(\s*)(?:\/\/|#) nestforge:feature:(\S+):end\s*$/;

/**
 * Applies feature markers to every text file in the generated project.
 * Enabled features keep their content and remove only the marker lines.
 * Disabled features remove the entire block, or the entire file for file markers.
 */
export async function applyFeatureMarkers(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    const files = await collectFiles(targetDir);

    for (const filePath of files) {
        await processFile(filePath, enabledFeatures);
    }

    await removeEmptyDirs(targetDir);
}

async function collectFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) continue;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await collectFiles(fullPath)));
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * The name after "feature:" can be a comma-separated list
 * (for example, "redis,auth:password"). In that case, every requirement must be
 * enabled for the content to remain. A single feature, the most common case,
 * continues to work as a one-item list.
 */
function isRequirementMet(rawName: string, enabledFeatures: Set<string>): boolean {
    return rawName
        .split(',')
        .map((name) => name.trim())
        .every((name) => enabledFeatures.has(name));
}

async function processFile(
    filePath: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    const original = await fs.readFile(
        filePath,
        'utf-8',
    );

    let lines = original.split('\n');

    const firstMeaningfulLine =
        lines.find(
            (line) => line.trim().length > 0,
        ) ?? '';

    const fileMatch =
        firstMeaningfulLine.match(FILE_MARKER);

    if (fileMatch) {
        const featureName = fileMatch[1];

        if (
            !isRequirementMet(
                featureName,
                enabledFeatures,
            )
        ) {
            await fs.remove(filePath);
            return;
        }

        lines = lines.filter(
            (line) => !FILE_MARKER.test(line),
        );
    }

    const processedLines = stripBlockMarkers(
        lines,
        enabledFeatures,
    );

    const processed = processedLines.join('\n');

    if (processed !== original) {
        await fs.writeFile(
            filePath,
            processed,
            'utf-8',
        );
    }
}

function stripBlockMarkers(lines: string[], enabledFeatures: Set<string>): string[] {
    const output: string[] = [];
    let skippingFeature: string | null = null;

    for (const line of lines) {
        if (skippingFeature) {
            const endMatch = line.match(BLOCK_END);
            if (endMatch && endMatch[2] === skippingFeature) {
                skippingFeature = null;
            }
            continue; // Skip the entire block, including its closing :end line.
        }

        const endMatch = line.match(BLOCK_END);
        if (endMatch) {
            continue;
        }

        const startMatch = line.match(BLOCK_START);
        if (startMatch) {
            const featureName = startMatch[2];

            if (!isRequirementMet(featureName, enabledFeatures)) {
                skippingFeature = featureName;
            }

            continue;
        }

        output.push(line);
    }

    return output;
}

async function removeEmptyDirs(dir: string): Promise<boolean> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let isEmpty = true;

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const childIsEmpty = await removeEmptyDirs(fullPath);
            if (childIsEmpty) {
                await fs.remove(fullPath);
            } else {
                isEmpty = false;
            }
        } else {
            isEmpty = false;
        }
    }

    return isEmpty;
}
