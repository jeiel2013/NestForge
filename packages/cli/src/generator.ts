import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ProjectOptions } from './prompts.js';
import { applyFeatureMarkers } from './features/markers.js';
import { removeDisabledDependencies } from './features/dependencies.js';
import { applyDatabaseConfig } from './features/database.js';
import { applyAuthStrategyRemoval } from './features/auth-strategy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_ROOT = path.resolve(__dirname, '../templates');

// só isso está de fato pronto por enquanto — ver packages/cli/README.md
const IMPLEMENTED_ORMS = ['prisma'];
const IMPLEMENTED_LANGUAGES = ['typescript'];
const IMPLEMENTED_DATABASES = ['postgres', 'mysql', 'sqlite'];
const IMPLEMENTED_AUTH_STRATEGIES = ['jwt', 'oauth', 'none'];

export async function generateProject(options: ProjectOptions): Promise<string> {
    const { projectName, language, orm, database, features, authStrategy, accessControl, createEnv } =
        options;

    if (!IMPLEMENTED_LANGUAGES.includes(language)) {
        throw new Error(
            `Geração em "${language}" ainda não está pronta — só "typescript" está implementado por enquanto. Contribuições são bem-vindas!`,
        );
    }

    if (orm === 'none') {
        throw new Error('Ainda não existe um template sem ORM. Escolha "prisma" por enquanto.');
    }

    if (!IMPLEMENTED_ORMS.includes(orm)) {
        throw new Error(
            `O template para "${orm}" ainda não está pronto — só "prisma" está implementado por enquanto. Contribuições são bem-vindas!`,
        );
    }

    if (!IMPLEMENTED_DATABASES.includes(database)) {
        throw new Error(
            `O banco "${database}" ainda não está pronto — hoje só ${IMPLEMENTED_DATABASES.join(', ')} estão implementados. Contribuições são bem-vindas!`,
        );
    }

    if (!IMPLEMENTED_AUTH_STRATEGIES.includes(authStrategy)) {
        throw new Error(
            `A estratégia de autenticação "${authStrategy}" ainda não está pronta — hoje só ${IMPLEMENTED_AUTH_STRATEGIES.join(', ')} estão implementadas ("jwt" já inclui OAuth Google/GitHub). Contribuições são bem-vindas!`,
        );
    }

    const templateDir = path.join(TEMPLATES_ROOT, orm);
    const targetDir = path.resolve(process.cwd(), projectName);

    if (await fs.pathExists(targetDir)) {
        throw new Error(`A pasta "${projectName}" já existe. Escolha outro nome ou remova a pasta.`);
    }

    await fs.copy(templateDir, targetDir);

    const enabledFeatures = buildEnabledFeatures(features, accessControl, database, authStrategy);

    await applyDockerToggle(targetDir, enabledFeatures);
    await applyDatabaseConfig(targetDir, database);
    await applyAuthStrategyRemoval(targetDir, enabledFeatures);
    await applyFeatureMarkers(targetDir, enabledFeatures);
    await removeDisabledDependencies(targetDir, enabledFeatures);
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
    if (authStrategy === 'jwt') {
        enabled.add('auth:password');
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

    const readmePath = path.join(targetDir, 'README.md');
    if (await fs.pathExists(readmePath)) {
        const readme = await fs.readFile(readmePath, 'utf-8');
        const updated = readme.replace(/^# NestForge/m, `# ${projectName}`);
        await fs.writeFile(readmePath, updated, 'utf-8');
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