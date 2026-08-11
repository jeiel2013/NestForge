import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ProjectOptions } from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_ROOT = path.resolve(__dirname, '../templates');

// só isso está de fato pronto por enquanto — ver packages/cli/README.md
const IMPLEMENTED_ORMS = ['prisma'];

export async function generateProject(options: ProjectOptions): Promise<string> {
    const { projectName, orm, features } = options;

    if (orm === 'none') {
        throw new Error('Ainda não existe um template sem ORM. Escolha "prisma" por enquanto.');
    }

    if (!IMPLEMENTED_ORMS.includes(orm)) {
        throw new Error(
            `O template para "${orm}" ainda não está pronto — só "prisma" está implementado por enquanto. Contribuições são bem-vindas!`,
        );
    }

    const templateDir = path.join(TEMPLATES_ROOT, orm);
    const targetDir = path.resolve(process.cwd(), projectName);

    if (await fs.pathExists(targetDir)) {
        throw new Error(`A pasta "${projectName}" já existe. Escolha outro nome ou remova a pasta.`);
    }

    await fs.copy(templateDir, targetDir);

    await applyFeatureToggles(targetDir, features);
    await renameProject(targetDir, projectName);

    return targetDir;
}

async function applyFeatureToggles(targetDir: string, features: string[]): Promise<void> {
    if (!features.includes('docker')) {
        await fs.remove(path.join(targetDir, 'Dockerfile'));
        await fs.remove(path.join(targetDir, 'docker-compose.yml'));
    }

    // TODO: toggles reais de swagger/jwt/redis — remover módulos, rotas e
    // imports relacionados quando o usuário não seleciona o recurso.
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