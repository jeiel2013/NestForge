import fs from 'fs-extra';
import path from 'node:path';
import ts from 'typescript';

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage']);

const TYPESCRIPT_DEV_DEPENDENCIES = [
    '@nestjs/cli',
    '@nestjs/schematics',
    '@types/bcryptjs',
    '@types/express-session',
    '@types/multer',
    '@types/node',
    '@types/nodemailer',
    '@types/passport-github2',
    '@types/passport-google-oauth20',
    '@types/passport-jwt',
    '@types/supertest',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'ts-node',
    'typescript',
    '@types/better-sqlite3',
    '@types/pg',
];

export async function applyLanguageTransform(
    targetDir: string,
    language: string,
    orm: string,
): Promise<void> {
    if (language !== 'javascript') {
        return;
    }

    const typescriptFiles = await collectTypeScriptFiles(targetDir);

    for (const filePath of typescriptFiles) {
        await transpileFile(filePath);
    }

    await removeTypeDeclarationFiles(targetDir);

    await fs.remove(path.join(targetDir, 'tsconfig.json'));
    await fs.remove(path.join(targetDir, 'tsconfig.build.json'));
    await fs.remove(path.join(targetDir, 'nest-cli.json'));

    await updatePackageJson(targetDir, orm);
    await updateVitestConfigs(targetDir);

    if (orm === 'drizzle') {
        await updateDrizzleWorkflow(targetDir);
    }
}

async function updateVitestConfigs(
    targetDir: string,
): Promise<void> {
    for (const configName of [
        'vitest.config.js',
        'vitest.e2e.config.js',
    ]) {
        const configPath = path.join(
            targetDir,
            configName,
        );

        if (!(await fs.pathExists(configPath))) {
            continue;
        }

        const config = await fs.readFile(
            configPath,
            'utf8',
        );

        await fs.writeFile(
            configPath,
            config.replaceAll('.ts', '.js'),
            'utf8',
        );
    }
}

async function collectTypeScriptFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) {
            continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await collectTypeScriptFiles(fullPath)));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
            files.push(fullPath);
        }
    }

    return files;
}

async function removeTypeDeclarationFiles(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) {
            continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await removeTypeDeclarationFiles(fullPath);
            continue;
        }

        if (entry.isFile() && entry.name.endsWith('.d.ts')) {
            await fs.remove(fullPath);
        }
    }
}

async function transpileFile(filePath: string): Promise<void> {
    const source = await fs.readFile(filePath, 'utf8');

    const result = ts.transpileModule(source, {
        compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.CommonJS,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            esModuleInterop: true,
            sourceMap: false,
        },
        fileName: filePath,
        reportDiagnostics: true,
    });

    const errors = (result.diagnostics ?? []).filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
    );

    if (errors.length > 0) {
        const details = errors
            .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
            .join('\n');

        throw new Error(`Falha ao converter "${filePath}" para JavaScript:\n${details}`);
    }

    const javascriptPath = filePath.replace(/\.ts$/, '.js');

    await fs.writeFile(javascriptPath, result.outputText, 'utf8');
    await fs.remove(filePath);
}

async function updatePackageJson(
    targetDir: string,
    orm: string,
): Promise<void> {
    const packageJsonPath = path.join(
        targetDir,
        'package.json',
    );

    const packageJson =
        await fs.readJson(packageJsonPath);

    packageJson.scripts = {
        ...packageJson.scripts,
        build: 'node --check src/main.js',
        start: 'node src/main.js',
        'start:dev': 'node --watch src/main.js',
        'start:debug':
            'node --inspect --watch src/main.js',
        'start:prod': 'node src/main.js',
        lint: 'eslint "{src,test}/**/*.js" --fix',
        format:
            'prettier --write "src/**/*.js" "test/**/*.js"',
        'test:e2e':
            'dotenv -e .env.test -- vitest run --config ./vitest.e2e.config.js',
    };

    if (orm === 'prisma') {
        packageJson.scripts['prisma:seed'] =
            'node prisma/seed.js';

        packageJson.prisma = {
            ...packageJson.prisma,
            seed: 'node prisma/seed.js',
        };
    }

    if (orm === 'typeorm') {
        packageJson.scripts.typeorm =
            'dotenv -e .env -- typeorm -d src/database/data-source.js';

        packageJson.scripts[
            'migration:generate'
        ] =
            'npm run typeorm -- migration:generate';

        packageJson.scripts[
            'migration:create'
        ] = 'typeorm migration:create';

        packageJson.scripts['migration:run'] =
            'npm run typeorm -- migration:run';

        packageJson.scripts[
            'migration:revert'
        ] =
            'npm run typeorm -- migration:revert';

        packageJson.scripts['pretest:e2e'] =
            'dotenv -e .env.test -- typeorm -d src/database/data-source.js migration:run';

        packageJson.scripts.seed =
            'dotenv -e .env -- node src/database/seed.js';

        delete packageJson.prisma;
        delete packageJson.scripts['prisma:seed'];
    }

    if (orm === 'drizzle') {
        packageJson.scripts[
            'drizzle:generate'
        ] =
            'dotenv -e .env -- drizzle-kit generate --config=drizzle.config.js';

        packageJson.scripts[
            'drizzle:migrate'
        ] =
            'dotenv -e .env -- drizzle-kit migrate --config=drizzle.config.js';

        packageJson.scripts[
            'drizzle:push'
        ] =
            'dotenv -e .env -- drizzle-kit push --config=drizzle.config.js';

        packageJson.scripts[
            'drizzle:studio'
        ] =
            'dotenv -e .env -- drizzle-kit studio --config=drizzle.config.js';

        packageJson.scripts[
            'pretest:e2e'
        ] =
            'dotenv -e .env.test -- drizzle-kit migrate --config=drizzle.config.js';

        packageJson.scripts.seed =
            'dotenv -e .env -- node src/database/seed.js';

        delete packageJson.prisma;
        delete packageJson.scripts[
            'prisma:seed'
        ];
    }

    for (const dependency of TYPESCRIPT_DEV_DEPENDENCIES) {
        delete packageJson.dependencies?.[dependency];
        delete packageJson.devDependencies?.[dependency];
    }

    await fs.writeJson(
        packageJsonPath,
        packageJson,
        { spaces: 2 },
    );
}

async function updateDrizzleWorkflow(
    targetDir: string,
): Promise<void> {
    const workflowPath = path.join(
        targetDir,
        '.github',
        'workflows',
        'ci.yml',
    );

    if (!(await fs.pathExists(workflowPath))) {
        return;
    }

    const workflow = await fs.readFile(
        workflowPath,
        'utf8',
    );

    const updated = workflow
        .replace(
            'npx drizzle-kit generate',
            'npx drizzle-kit generate --config=drizzle.config.js',
        )
        .replace(
            'npx drizzle-kit migrate',
            'npx drizzle-kit migrate --config=drizzle.config.js',
        );

    await fs.writeFile(
        workflowPath,
        updated,
        'utf8',
    );
}
