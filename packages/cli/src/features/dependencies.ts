import fs from 'fs-extra';
import path from 'node:path';

/**
 * Pacotes (dependencies ou devDependencies) que só fazem sentido se a feature
 * correspondente estiver habilitada. Mantido separado dos marcadores de código
 * porque package.json é JSON puro — não aceita comentário.
 */
const FEATURE_DEPENDENCIES: Record<string, string[]> = {
    swagger: ['@nestjs/swagger'],
    validation: ['nestjs-zod'],
    redis: [
        '@nestjs/bullmq',
        'bullmq',
        'ioredis',
        'nodemailer',
        '@types/nodemailer',
    ],
    rbac: [], // hoje não tem dependência própria — só código (guards/decorators)
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