import fs from 'fs-extra';
import path from 'node:path';

/**
 * Pacotes (dependencies ou devDependencies) que só fazem sentido se a feature
 * correspondente estiver habilitada. Mantido separado dos marcadores de código
 * porque package.json é JSON puro — não aceita comentário.
 */
const FEATURE_DEPENDENCIES: Record<
    string,
    string[]
> = {
    swagger: ['@nestjs/swagger'],

    redis: [
        '@nestjs/bullmq',
        'bullmq',
        'ioredis',
        'nodemailer',
        '@types/nodemailer',
    ],

    'auth:session': [
        '@quixo3/prisma-session-store',
        'connect-typeorm',
        'express-session',
        '@types/express-session',
    ],

    'auth:token': [
        '@nestjs/jwt',
        'passport-jwt',
        '@types/passport-jwt',
    ],

    'database:postgres': [
        'pg',
        '@types/pg',
    ],

    'database:mysql': [
        'mysql2',
    ],

    'database:sqlite': [
        'better-sqlite3',
        '@types/better-sqlite3',
    ],

    rbac: [],
};

export async function removeDisabledDependencies(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    const pkgPath = path.join(targetDir, 'package.json');
    if (!(await fs.pathExists(pkgPath))) {
        return;
    }

    const pkg = await fs.readJson(pkgPath);

    for (const [feature, packages] of Object.entries(FEATURE_DEPENDENCIES)) {
        if (enabledFeatures.has(feature)) continue;

        for (const pkgName of packages) {
            delete pkg.dependencies?.[pkgName];
            delete pkg.devDependencies?.[pkgName];
        }
    }

    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}