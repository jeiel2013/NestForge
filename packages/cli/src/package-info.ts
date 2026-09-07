import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

interface PackageManifest {
    name?: unknown;
    version?: unknown;
}

const packageJsonPath = fileURLToPath(
    new URL('../package.json', import.meta.url),
);

export async function readPackageInfo(): Promise<{
    name: string;
    version: string;
}> {
    const manifest = (await fs.readJson(
        packageJsonPath,
    )) as PackageManifest;

    if (
        typeof manifest.name !== 'string' ||
        typeof manifest.version !== 'string'
    ) {
        throw new Error('Unable to read the NestForge package information.');
    }

    return {
        name: manifest.name,
        version: manifest.version,
    };
}
