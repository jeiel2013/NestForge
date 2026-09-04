import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ProjectOptions } from './prompts.js';
import { applyFeatureMarkers } from './features/markers.js';
import { removeDisabledDependencies } from './features/dependencies.js';
import { applyDatabaseConfig } from './features/database.js';
import { applyAuthStrategyRemoval } from './features/auth-strategy.js';
import { applyLanguageTransform } from './features/language.js';
import { applyNoOrmTransform } from './features/no-orm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_TEMPLATES_ROOT = path.resolve(__dirname, '../templates');
const MONOREPO_TEMPLATES_ROOT = path.resolve(__dirname, '../../../templates');

// These are the options currently implemented — see packages/cli/README.md
const IMPLEMENTED_ORMS = [
    'prisma',
    'typeorm',
    'drizzle',
    'none',
];
const IMPLEMENTED_LANGUAGES = ['typescript', 'javascript'];
const IMPLEMENTED_DATABASES = ['postgres', 'mysql', 'sqlite'];
const IMPLEMENTED_AUTH_STRATEGIES = ['jwt', 'session', 'oauth', 'none'];

async function resolveTemplatesRoot(): Promise<string> {
    if (await fs.pathExists(PACKAGE_TEMPLATES_ROOT)) {
        return PACKAGE_TEMPLATES_ROOT;
    }

    return MONOREPO_TEMPLATES_ROOT;
}

export async function generateProject(options: ProjectOptions): Promise<string> {
    const { projectName, language, orm, database, features, authStrategy, accessControl, createEnv } =
        options;

    if (!IMPLEMENTED_LANGUAGES.includes(language)) {
        throw new Error(
            `Generation in "${language}" is not ready yet — only "typescript" is currently implemented. Contributions are welcome!`,
        );
    }

    if (!IMPLEMENTED_ORMS.includes(orm)) {
        throw new Error(
            `The template for "${orm}" is not ready yet — currently available: ${IMPLEMENTED_ORMS.join(', ',)}. Contributions are welcome!`,
        );
    }

    if (orm === 'none' && database !== 'none') {
        throw new Error('Projects without an ORM must use "none" as their database option.');
    }

    if (orm !== 'none' && !IMPLEMENTED_DATABASES.includes(database)) {
        throw new Error(
            `The "${database}" database is not ready yet — currently implemented: ${IMPLEMENTED_DATABASES.join(', ')}. Contributions are welcome!`,
        );
    }

    if (orm === 'none' && authStrategy !== 'none') {
        throw new Error('Projects without an ORM currently support only the "none" authentication strategy.');
    }

    if (orm === 'none' && accessControl) {
        throw new Error('Access control requires authentication and is not available without an ORM.');
    }

    if (!IMPLEMENTED_AUTH_STRATEGIES.includes(authStrategy)) {
        throw new Error(
            `The "${authStrategy}" authentication strategy is not ready yet — currently implemented: ${IMPLEMENTED_AUTH_STRATEGIES.join(', ')} ("jwt" already includes Google/GitHub OAuth). Contributions are welcome!`,
        );
    }

    const templatesRoot = await resolveTemplatesRoot();
    const templateName = orm === 'none' ? 'prisma' : orm;
    const templateDir = path.join(templatesRoot, templateName);
    const targetDir = path.resolve(process.cwd(), projectName);

    if (await fs.pathExists(targetDir)) {
        throw new Error(`The "${projectName}" directory already exists. Choose another name or remove the directory.`);
    }

    await fs.copy(templateDir, targetDir);

    const enabledFeatures = buildEnabledFeatures(features, accessControl, database, authStrategy);

    await applyDockerToggle(targetDir, enabledFeatures);
    if (orm !== 'none') {
        await applyDatabaseConfig(targetDir, database);
    }
    await applyAuthStrategyRemoval(targetDir, enabledFeatures);
    await applyFeatureMarkers(targetDir, enabledFeatures);
    await removeDisabledDependencies(targetDir, enabledFeatures);

    if (orm === 'none') {
        await applyNoOrmTransform(targetDir, enabledFeatures);
    }

    await applyLanguageTransform(targetDir, language, orm);
    await renameProject(targetDir, projectName);

    if (createEnv) {
        await generateEnvFile(targetDir);
    }

    return targetDir;
}

function buildEnabledFeatures(
    features: string[],
    accessControl: boolean,
    database: string,
    authStrategy: string,
): Set<string> {
    const enabled = new Set(features);

    if (accessControl) {
        enabled.add('rbac');
    }

    enabled.add(`database:${database}`);
    enabled.add(`auth:${authStrategy}`);

    if (authStrategy !== 'none') {
        enabled.add('auth:enabled');
    }

    if (authStrategy === 'jwt') {
        enabled.add('auth:password');
        enabled.add('auth:token');
    }

    if (authStrategy === 'oauth') {
        enabled.add('auth:token');
    }

    if (authStrategy === 'session') {
        enabled.add('auth:password');
        enabled.add('auth:session');
    }

    return enabled;
}

async function applyDockerToggle(targetDir: string, enabledFeatures: Set<string>): Promise<void> {
    if (enabledFeatures.has('docker')) return;

    await fs.remove(path.join(targetDir, 'Dockerfile'));
    await fs.remove(path.join(targetDir, 'docker-compose.yml'));
}

async function renameProject(targetDir: string, projectName: string): Promise<void> {
    const pkgPath = path.join(targetDir, 'package.json');
    const pkg = await fs.readJson(pkgPath);
    pkg.name = projectName;
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });

    const readmeNames = [
        'README.md',
        'README.pt-BR.md',
    ];

    for (const readmeName of readmeNames) {
        const readmePath = path.join(
            targetDir,
            readmeName,
        );

        if (!(await fs.pathExists(readmePath))) {
            continue;
        }

        const readme = await fs.readFile(
            readmePath,
            'utf-8',
        );
        const updated = readme.replace(
            /^# NestForge/m,
            `# ${projectName}`,
        );

        await fs.writeFile(
            readmePath,
            updated,
            'utf-8',
        );
    }
}

async function generateEnvFile(targetDir: string): Promise<void> {
    const examplePath = path.join(targetDir, '.env.example');
    const envPath = path.join(targetDir, '.env');

    if (!(await fs.pathExists(examplePath))) {
        return;
    }

    await fs.copy(examplePath, envPath);
}
