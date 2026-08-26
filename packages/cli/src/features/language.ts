import fs from 'fs-extra';
import path from 'node:path';
import ts from 'typescript';

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage']);

const TYPESCRIPT_DEV_DEPENDENCIES = [
    '@nestjs/cli',
    '@nestjs/schematics',
    '@types/bcryptjs',
    '@types/cookie-parser',
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
];

export async function applyLanguageTransform(
    targetDir: string,
    language: string,
): Promise<void> {
    if (language !== 'javascript') {
        return;
    }

    const typescriptFiles = await collectTypeScriptFiles(targetDir);

    for (const filePath of typescriptFiles) {
        await transpileFile(filePath);
    }

    await fs.remove(path.join(targetDir, 'tsconfig.json'));
    await fs.remove(path.join(targetDir, 'tsconfig.build.json'));
    await fs.remove(path.join(targetDir, 'nest-cli.json'));

    await updatePackageJson(targetDir);
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

async function updatePackageJson(targetDir: string): Promise<void> {
    const packageJsonPath = path.join(targetDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.scripts = {
        ...packageJson.scripts,
        build: 'node --check src/main.js',
        start: 'node src/main.js',
        'start:dev': 'node --watch src/main.js',
        'start:debug': 'node --inspect --watch src/main.js',
        'start:prod': 'node src/main.js',
        lint: 'eslint "{src,test}/**/*.js" --fix',
        format: 'prettier --write "src/**/*.js" "test/**/*.js"',
        'prisma:seed': 'node prisma/seed.js',
        'test:e2e': 'dotenv -e .env.test -- vitest run --config ./vitest.e2e.config.js',
    };

    packageJson.prisma = {
        ...packageJson.prisma,
        seed: 'node prisma/seed.js',
    };

    for (const dependency of TYPESCRIPT_DEV_DEPENDENCIES) {
        delete packageJson.dependencies?.[dependency];
        delete packageJson.devDependencies?.[dependency];
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}
