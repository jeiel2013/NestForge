import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import fs from 'fs-extra';
import { generateProject } from '../src/generator.js';
import type { ProjectOptions } from '../src/prompts.js';

function makeOptions(overrides: Partial<ProjectOptions> = {}): ProjectOptions {
    return {
        projectName: 'nestforge-test',
        language: 'typescript',
        orm: 'prisma',
        database: 'postgres',
        features: ['docker', 'swagger', 'validation', 'redis'],
        authStrategy: 'jwt',
        accessControl: true,
        createEnv: false,
        ...overrides,
    };
}

async function withGeneratedProject(
    options: ProjectOptions,
    assertion: (targetDir: string) => Promise<void>,
): Promise<void> {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'nestforge-'));
    const previousCwd = process.cwd();

    process.chdir(tempDir);

    try {
        const targetDir = await generateProject(options);
        await assertion(targetDir);
    } finally {
        process.chdir(previousCwd);
        await rm(tempDir, { recursive: true, force: true });
    }
}

async function withTempDirectory(
    assertion: (tempDir: string) => Promise<void>,
): Promise<void> {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'nestforge-'));
    const previousCwd = process.cwd();

    process.chdir(tempDir);

    try {
        await assertion(tempDir);
    } finally {
        process.chdir(previousCwd);
        await rm(tempDir, { recursive: true, force: true });
    }
}

test('gera o projeto padrão com PostgreSQL e JWT', { concurrency: false }, async () => {
    await withGeneratedProject(makeOptions(), async (targetDir) => {
        const schema = await readFile(path.join(targetDir, 'prisma', 'schema.prisma'), 'utf8');

        assert.match(schema, /provider = "postgresql"/);
        assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'auth')), true);
        assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'users')), true);
        assert.equal(await fs.pathExists(path.join(targetDir, 'Dockerfile')), true);
        assert.equal(await fs.pathExists(path.join(targetDir, 'docker-compose.yml')), true);
    });
});

test('gera MySQL sem recursos Redis', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'mysql-project',
            database: 'mysql',
            features: ['docker', 'swagger', 'validation'],
        }),
        async (targetDir) => {
            const schema = await readFile(path.join(targetDir, 'prisma', 'schema.prisma'), 'utf8');
            const envExample = await readFile(path.join(targetDir, '.env.example'), 'utf8');
            const compose = await readFile(path.join(targetDir, 'docker-compose.yml'), 'utf8');
            const packageJson = await fs.readJson(path.join(targetDir, 'package.json'));

            assert.match(schema, /provider = "mysql"/);
            assert.match(envExample, /DATABASE_URL="mysql:\/\//);
            assert.match(compose, /^\s{2}mysql:/m);
            assert.doesNotMatch(compose, /^\s{2}postgres:/m);

            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'mail')), false);
            assert.equal(packageJson.dependencies['@nestjs/bullmq'], undefined);
            assert.equal(packageJson.dependencies.bullmq, undefined);
            assert.equal(packageJson.dependencies.ioredis, undefined);
        },
    );
});

test('gera SQLite sem recursos opcionais e sem autenticação', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'sqlite-project',
            database: 'sqlite',
            features: [],
            authStrategy: 'none',
            accessControl: false,
        }),
        async (targetDir) => {
            const schema = await readFile(path.join(targetDir, 'prisma', 'schema.prisma'), 'utf8');
            const envExample = await readFile(path.join(targetDir, '.env.example'), 'utf8');
            const main = await readFile(path.join(targetDir, 'src', 'main.ts'), 'utf8');
            const packageJson = await fs.readJson(path.join(targetDir, 'package.json'));

            assert.match(schema, /provider = "sqlite"/);
            assert.match(envExample, /DATABASE_URL="file:\.\/dev\.db"/);

            assert.equal(await fs.pathExists(path.join(targetDir, 'Dockerfile')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'docker-compose.yml')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'auth')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'users')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'mail')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'test', 'auth.e2e-spec.ts')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'test', 'users.e2e-spec.ts')), false);

            assert.doesNotMatch(main, /ZodValidationPipe/);
            assert.equal(packageJson.dependencies['@nestjs/swagger'], undefined);
        },
    );
});

test('gera OAuth-only sem fluxos e testes baseados em senha', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'oauth-project',
            authStrategy: 'oauth',
            accessControl: false,
        }),
        async (targetDir) => {
            const appModule = await readFile(path.join(targetDir, 'src', 'app.module.ts'), 'utf8');
            const authController = await readFile(
                path.join(targetDir, 'src', 'auth', 'auth.controller.ts'),
                'utf8',
            );

            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'auth')), true);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'users')), true);
            assert.match(appModule, /import { AuthModule } from '\.\/auth\/auth\.module'/);
            assert.match(appModule, /AuthModule,/);

            assert.equal(
                await fs.pathExists(path.join(targetDir, 'src', 'auth', 'dto', 'login.dto.ts')),
                false,
            );
            assert.equal(
                await fs.pathExists(path.join(targetDir, 'src', 'auth', 'dto', 'register.dto.ts')),
                false,
            );
            assert.equal(await fs.pathExists(path.join(targetDir, 'test', 'auth.e2e-spec.ts')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'test', 'users.e2e-spec.ts')), false);

            assert.doesNotMatch(authController, /@Post\('login'\)/);
            assert.doesNotMatch(authController, /@Post\('register'\)/);
        },
    );
});

test('gera autenticação por Session/Cookies sem recursos JWT', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'session-project',
            authStrategy: 'session',
            features: ['swagger', 'validation'],
        }),
        async (targetDir) => {
            const schema = await readFile(
                path.join(targetDir, 'prisma', 'schema.prisma'),
                'utf8',
            );
            const main = await readFile(
                path.join(targetDir, 'src', 'main.ts'),
                'utf8',
            );
            const authModule = await readFile(
                path.join(targetDir, 'src', 'auth', 'auth.module.ts'),
                'utf8',
            );
            const authController = await readFile(
                path.join(targetDir, 'src', 'auth', 'auth.controller.ts'),
                'utf8',
            );
            const packageJson = await fs.readJson(
                path.join(targetDir, 'package.json'),
            );

            assert.match(schema, /model Session/);
            assert.match(schema, /@@map\("sessions"\)/);

            assert.match(main, /express-session/);
            assert.match(main, /PrismaSessionStore/);
            assert.match(main, /name: 'nestforge\.sid'/);

            assert.match(authModule, /SessionService/);
            assert.match(authModule, /SessionAuthGuard/);
            assert.doesNotMatch(authModule, /JwtModule/);
            assert.doesNotMatch(authModule, /JwtStrategy/);
            assert.doesNotMatch(authModule, /JwtAuthGuard/);
            assert.doesNotMatch(authModule, /TokenService/);

            assert.match(authController, /registerWithSession/);
            assert.match(authController, /loginWithSession/);
            assert.match(authController, /logoutSession/);
            assert.doesNotMatch(authController, /@Post\('refresh'\)/);
            assert.doesNotMatch(authController, /TOKENS_EXAMPLE/);

            assert.equal(
                await fs.pathExists(
                    path.join(targetDir, 'src', 'auth', 'session.service.ts'),
                ),
                true,
            );
            assert.equal(
                await fs.pathExists(
                    path.join(
                        targetDir,
                        'src',
                        'auth',
                        'guards',
                        'session-auth.guard.ts',
                    ),
                ),
                true,
            );

            assert.equal(
                await fs.pathExists(
                    path.join(targetDir, 'src', 'auth', 'token.service.ts'),
                ),
                false,
            );
            assert.equal(
                await fs.pathExists(
                    path.join(
                        targetDir,
                        'src',
                        'auth',
                        'strategies',
                        'jwt.strategy.ts',
                    ),
                ),
                false,
            );
            assert.equal(
                await fs.pathExists(
                    path.join(
                        targetDir,
                        'src',
                        'auth',
                        'guards',
                        'jwt-auth.guard.ts',
                    ),
                ),
                false,
            );
            assert.equal(
                await fs.pathExists(
                    path.join(
                        targetDir,
                        'src',
                        'auth',
                        'dto',
                        'refresh-token.dto.ts',
                    ),
                ),
                false,
            );

            assert.equal(
                await fs.pathExists(
                    path.join(targetDir, 'test', 'session-auth.e2e-spec.ts'),
                ),
                true,
            );
            assert.equal(
                await fs.pathExists(
                    path.join(targetDir, 'test', 'auth.e2e-spec.ts'),
                ),
                false,
            );
            assert.equal(
                await fs.pathExists(
                    path.join(targetDir, 'test', 'users.e2e-spec.ts'),
                ),
                false,
            );

            assert.notEqual(
                packageJson.dependencies['@quixo3/prisma-session-store'],
                undefined,
            );
            assert.notEqual(
                packageJson.dependencies['express-session'],
                undefined,
            );
            assert.notEqual(
                packageJson.devDependencies['@types/express-session'],
                undefined,
            );

            assert.equal(packageJson.dependencies['@nestjs/jwt'], undefined);
            assert.equal(packageJson.dependencies['passport-jwt'], undefined);
            assert.equal(
                packageJson.devDependencies['@types/passport-jwt'],
                undefined,
            );
        },
    );
});

test('gera projeto em JavaScript', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'javascript-project',
            language: 'javascript',
        }),
        async (targetDir) => {
            const packageJson = await fs.readJson(path.join(targetDir, 'package.json'));

            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'main.js')), true);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'main.ts')), false);

            assert.equal(await fs.pathExists(path.join(targetDir, 'prisma', 'seed.js')), true);
            assert.equal(await fs.pathExists(path.join(targetDir, 'prisma', 'seed.ts')), false);

            assert.equal(await fs.pathExists(path.join(targetDir, 'vitest.config.js')), true);
            assert.equal(await fs.pathExists(path.join(targetDir, 'vitest.e2e.config.js')), true);
            assert.equal(await fs.pathExists(path.join(targetDir, 'vitest.config.ts')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'vitest.e2e.config.ts')), false);

            assert.equal(await fs.pathExists(path.join(targetDir, 'tsconfig.json')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'tsconfig.build.json')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'nest-cli.json')), false);

            assert.equal(packageJson.scripts['start:dev'], 'node --watch src/main.js');
            assert.equal(
                packageJson.scripts['test:e2e'],
                'dotenv -e .env.test -- vitest run --config ./vitest.e2e.config.js',
            );

            assert.equal(packageJson.dependencies.typescript, undefined);
            assert.equal(packageJson.devDependencies.typescript, undefined);
            assert.equal(packageJson.devDependencies['@nestjs/cli'], undefined);
            assert.equal(packageJson.devDependencies['@typescript-eslint/parser'], undefined);
            assert.equal(packageJson.devDependencies['ts-node'], undefined);
        },
    );
});

test('recusa opções ainda não implementadas sem criar projeto', { concurrency: false }, async () => {
    const unsupportedOptions: Array<[string, Partial<ProjectOptions>]> = [
        ['TypeORM', { orm: 'typeorm' }],
        ['Drizzle', { orm: 'drizzle' }],
        ['MongoDB', { database: 'mongodb' }],
    ];

    for (const [label, overrides] of unsupportedOptions) {
        await withTempDirectory(async (tempDir) => {
            const projectName = `unsupported-${label.toLowerCase().replaceAll('/', '-')}`;

            await assert.rejects(
                () => generateProject(makeOptions({ projectName, ...overrides })),
                Error,
            );

            assert.equal(await fs.pathExists(path.join(tempDir, projectName)), false);
        });
    }
})