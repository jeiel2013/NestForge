import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import fs from 'fs-extra';
import { generateProject } from '../src/generator.js';
import type { ProjectOptions } from '../src/prompts.js';
import { validateProjectName } from '../src/project-name.js';

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

function assertPrismaProviders(
    schema: string,
    datasourceProvider: 'postgresql' | 'mysql' | 'sqlite',
): void {
    assert.match(
        schema,
        /generator client\s*\{[^}]*provider\s*=\s*"prisma-client-js"[^}]*\}/,
    );

    assert.match(
        schema,
        new RegExp(
            `datasource db\\s*\\{[^}]*provider\\s*=\\s*"${datasourceProvider}"[^}]*\\}`,
        ),
    );
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

async function listFilesRecursively(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await listFilesRecursively(entryPath)));
        } else {
            files.push(entryPath);
        }
    }

    return files;
}

test('gera o projeto padrão com PostgreSQL e JWT', { concurrency: false }, async () => {
    await withGeneratedProject(makeOptions(), async (targetDir) => {
        const schema = await readFile(path.join(targetDir, 'prisma', 'schema.prisma'), 'utf8');

        assertPrismaProviders(schema, 'postgresql');
        assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'auth')), true);
        assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'users')), true);
        assert.equal(await fs.pathExists(path.join(targetDir, 'Dockerfile')), true);
        assert.equal(await fs.pathExists(path.join(targetDir, 'docker-compose.yml')), true);

        const englishReadme = await readFile(
            path.join(targetDir, 'README.md'),
            'utf8',
        );
        const portugueseReadme = await readFile(
            path.join(targetDir, 'README.pt-BR.md'),
            'utf8',
        );

        assert.match(
            englishReadme,
            /^# nestforge-test/m,
        );
        assert.match(
            portugueseReadme,
            /^# nestforge-test/m,
        );
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

            assertPrismaProviders(schema, 'mysql');
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

            assertPrismaProviders(schema, 'sqlite');
            assert.match(envExample, /DATABASE_URL="file:\.\/dev\.db"/);
            assert.doesNotMatch(envExample, /JWT_ACCESS_SECRET=/);
            assert.doesNotMatch(envExample, /SESSION_SECRET=/);

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

            const envExample = await readFile(
                path.join(targetDir, '.env.example'),
                'utf8',
            );
            const envTest = await readFile(
                path.join(targetDir, '.env.test'),
                'utf8',
            );
            const envValidation = await readFile(
                path.join(
                    targetDir,
                    'src',
                    'config',
                    'env.validation.ts',
                ),
                'utf8',
            );

            assertPrismaProviders(schema, 'postgresql');

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

            assert.match(envExample, /SESSION_SECRET=/);
            assert.match(envExample, /SESSION_MAX_AGE=/);
            assert.doesNotMatch(envExample, /JWT_ACCESS_SECRET=/);
            assert.doesNotMatch(envExample, /JWT_REFRESH_SECRET=/);

            assert.match(envTest, /SESSION_SECRET=/);
            assert.match(envTest, /SESSION_MAX_AGE=/);
            assert.doesNotMatch(envTest, /JWT_ACCESS_SECRET=/);
            assert.doesNotMatch(envTest, /JWT_REFRESH_SECRET=/);

            assert.match(envValidation, /SESSION_SECRET:/);
            assert.match(envValidation, /SESSION_MAX_AGE:/);
            assert.doesNotMatch(envValidation, /JWT_ACCESS_SECRET:/);
            assert.doesNotMatch(envValidation, /JWT_REFRESH_SECRET:/);

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

test(
    'gera TypeORM com SQLite e Session/Cookies',
    { concurrency: false },
    async () => {
        await withGeneratedProject(
            makeOptions({
                projectName: 'typeorm-sqlite-session',
                orm: 'typeorm',
                database: 'sqlite',
                language: 'typescript',
                authStrategy: 'session',
                features: ['validation'],
                accessControl: false,
            }),
            async (targetDir) => {
                const envExample = await readFile(
                    path.join(targetDir, '.env.example'),
                    'utf8',
                );

                const main = await readFile(
                    path.join(targetDir, 'src', 'main.ts'),
                    'utf8',
                );

                const sessionEntity = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'auth',
                        'entities',
                        'session.entity.ts',
                    ),
                    'utf8',
                );

                const usersService = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'users',
                        'users.service.ts',
                    ),
                    'utf8',
                );

                const packageJson = await fs.readJson(
                    path.join(targetDir, 'package.json'),
                );

                assert.match(
                    envExample,
                    /^DB_TYPE=sqlite$/m,
                );

                assert.match(
                    envExample,
                    /DATABASE_URL="file:\.\/dev\.db"/,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(targetDir, 'prisma'),
                    ),
                    false,
                );

                assert.doesNotMatch(
                    sessionEntity,
                    /nestforge:feature/,
                );

                assert.doesNotMatch(
                    sessionEntity,
                    /timestamp with time zone/,
                );

                assert.equal(
                    sessionEntity.match(
                        /type:\s*['"]datetime['"]/g,
                    )?.length,
                    1,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'data-source.ts',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'auth',
                            'entities',
                            'session.entity.ts',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'auth',
                            'entities',
                            'refresh-token.entity.ts',
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
                            'entities',
                            'password-reset-token.entity.ts',
                        ),
                    ),
                    false,
                );

                assert.match(main, /TypeormStore/);
                assert.match(main, /DataSource/);
                assert.doesNotMatch(
                    main,
                    /PrismaSessionStore|PrismaService/,
                );

                assert.match(
                    usersService,
                    /@InjectRepository\(UserEntity\)/,
                );

                assert.doesNotMatch(
                    usersService,
                    /PrismaService|this\.prisma/,
                );

                assert.notEqual(
                    packageJson.dependencies.typeorm,
                    undefined,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    '@nestjs/typeorm'
                    ],
                    undefined,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    'better-sqlite3'
                    ],
                    undefined,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    'connect-typeorm'
                    ],
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies.pg,
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies.mysql2,
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies[
                    '@quixo3/prisma-session-store'
                    ],
                    undefined,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(targetDir, 'Dockerfile'),
                    ),
                    false,
                );
            },
        );
    },
);

test(
    'configura PostgreSQL e MySQL no template TypeORM',
    { concurrency: false },
    async () => {
        const cases = [
            {
                database: 'postgres' as const,
                projectName: 'typeorm-postgres',
                dbType: 'postgres',
                driver: 'pg',
                columnType: 'timestamp with time zone',
            },
            {
                database: 'mysql' as const,
                projectName: 'typeorm-mysql',
                dbType: 'mysql',
                driver: 'mysql2',
                columnType: 'datetime',
            },
        ];

        for (const testCase of cases) {
            await withGeneratedProject(
                makeOptions({
                    projectName: testCase.projectName,
                    orm: 'typeorm',
                    database: testCase.database,
                    authStrategy: 'jwt',
                    features: [],
                    accessControl: false,
                }),
                async (targetDir) => {
                    const envExample = await readFile(
                        path.join(
                            targetDir,
                            '.env.example',
                        ),
                        'utf8',
                    );

                    const refreshTokenEntity =
                        await readFile(
                            path.join(
                                targetDir,
                                'src',
                                'auth',
                                'entities',
                                'refresh-token.entity.ts',
                            ),
                            'utf8',
                        );

                    const packageJson =
                        await fs.readJson(
                            path.join(
                                targetDir,
                                'package.json',
                            ),
                        );

                    assert.match(
                        envExample,
                        new RegExp(
                            `^DB_TYPE=${testCase.dbType}$`,
                            'm',
                        ),
                    );

                    assert.match(
                        refreshTokenEntity,
                        new RegExp(testCase.columnType),
                    );

                    assert.doesNotMatch(
                        refreshTokenEntity,
                        /nestforge:feature/,
                    );

                    assert.notEqual(
                        packageJson.dependencies[
                        testCase.driver
                        ],
                        undefined,
                    );

                    if (testCase.database === 'postgres') {
                        assert.equal(
                            packageJson.dependencies.mysql2,
                            undefined,
                        );

                        assert.equal(
                            packageJson.dependencies[
                            'better-sqlite3'
                            ],
                            undefined,
                        );
                    }

                    if (testCase.database === 'mysql') {
                        assert.equal(
                            packageJson.dependencies.pg,
                            undefined,
                        );

                        assert.equal(
                            packageJson.dependencies[
                            'better-sqlite3'
                            ],
                            undefined,
                        );
                    }
                },
            );
        }
    },
);

test(
    'gera Drizzle com SQLite e JWT',
    { concurrency: false },
    async () => {
        await withGeneratedProject(
            makeOptions({
                projectName: 'drizzle-sqlite-jwt',
                orm: 'drizzle',
                database: 'sqlite',
                language: 'typescript',
                authStrategy: 'jwt',
                features: ['validation'],
                accessControl: false,
            }),
            async (targetDir) => {
                const envExample = await readFile(
                    path.join(
                        targetDir,
                        '.env.example',
                    ),
                    'utf8',
                );

                const drizzleConfig = await readFile(
                    path.join(
                        targetDir,
                        'drizzle.config.ts',
                    ),
                    'utf8',
                );

                const authController = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'auth',
                        'auth.controller.ts',
                    ),
                    'utf8',
                );

                const sqliteSchema = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'database',
                        'schema',
                        'sqlite.schema.ts',
                    ),
                    'utf8',
                );

                const databaseModule = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'database',
                        'database.module.ts',
                    ),
                    'utf8',
                );

                const healthIndicator = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'health',
                        'indicators',
                        'drizzle-health.indicator.ts',
                    ),
                    'utf8',
                )

                const usersService = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'users',
                        'users.service.ts',
                    ),
                    'utf8',
                );

                const packageJson =
                    await fs.readJson(
                        path.join(
                            targetDir,
                            'package.json',
                        ),
                    );

                assert.match(
                    envExample,
                    /^DB_TYPE=sqlite$/m,
                );

                assert.match(
                    envExample,
                    /DATABASE_URL="file:\.\/dev\.db"/,
                );

                assert.match(
                    authController,
                    /@Post\('register'\)/,
                );

                assert.match(
                    authController,
                    /@Post\('login'\)/,
                );

                assert.match(
                    authController,
                    /async register\(/,
                );

                assert.match(
                    authController,
                    /async login\(/,
                );

                assert.doesNotMatch(
                    authController,
                    /getCsrfToken/,
                );

                assert.match(
                    healthIndicator,
                    /export class DrizzleHealthIndicator/,
                );

                assert.match(
                    healthIndicator,
                    /this\.client\.prepare\('SELECT 1'\)\.get\(\)/,
                );

                assert.doesNotMatch(
                    healthIndicator,
                    /describe\('DrizzleHealthIndicator'/,
                );

                assert.doesNotMatch(
                    healthIndicator,
                    /from ['"]vitest['"]/,
                );

                assert.doesNotMatch(
                    healthIndicator,
                    /from ['"]\.\/drizzle-health\.indicator['"]/,
                );

                assert.doesNotMatch(
                    healthIndicator,
                    /nestforge:feature/,
                );

                assert.match(
                    drizzleConfig,
                    /dialect:\s*'sqlite'/,
                );

                assert.match(
                    drizzleConfig,
                    /sqlite\.schema\.ts/,
                );

                assert.doesNotMatch(
                    drizzleConfig,
                    /dialect:\s*'postgresql'/,
                );

                assert.doesNotMatch(
                    drizzleConfig,
                    /dialect:\s*'mysql'/,
                );

                assert.doesNotMatch(
                    drizzleConfig,
                    /nestforge:feature/,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'schema',
                            'postgres.schema.ts',
                        ),
                    ),
                    false,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'schema',
                            'mysql.schema.ts',
                        ),
                    ),
                    false,
                );

                assert.match(
                    sqliteSchema,
                    /export const users/,
                );

                assert.match(
                    sqliteSchema,
                    /export const refreshTokens/,
                );

                assert.doesNotMatch(
                    sqliteSchema,
                    /export const sessions/,
                );

                assert.doesNotMatch(
                    sqliteSchema,
                    /passwordResetTokens/,
                );

                assert.doesNotMatch(
                    sqliteSchema,
                    /nestforge:feature/,
                );

                assert.match(
                    databaseModule,
                    /BetterSqlite3/,
                );

                assert.doesNotMatch(
                    databaseModule,
                    /new Pool/,
                );

                assert.doesNotMatch(
                    databaseModule,
                    /createPool/,
                );

                assert.doesNotMatch(
                    databaseModule,
                    /nestforge:feature/,
                );

                assert.match(
                    usersService,
                    /@InjectDatabase\(\)/,
                );

                assert.doesNotMatch(
                    usersService,
                    /InjectRepository|Repository|typeorm/,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'auth',
                            'token.service.ts',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'auth',
                            'drizzle-session.store.ts',
                        ),
                    ),
                    false,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    'drizzle-orm'
                    ],
                    undefined,
                );

                assert.notEqual(
                    packageJson.devDependencies[
                    'drizzle-kit'
                    ],
                    undefined,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    'better-sqlite3'
                    ],
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies.pg,
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies.mysql2,
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies.typeorm,
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies[
                    '@nestjs/typeorm'
                    ],
                    undefined,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'Dockerfile',
                        ),
                    ),
                    false,
                );
            },
        );
    },
);

test(
    'gera Drizzle com SQLite e Session/Cookies',
    { concurrency: false },
    async () => {
        await withGeneratedProject(
            makeOptions({
                projectName:
                    'drizzle-sqlite-session',
                orm: 'drizzle',
                database: 'sqlite',
                language: 'typescript',
                authStrategy: 'session',
                features: ['validation'],
                accessControl: false,
            }),
            async (targetDir) => {
                const schema = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'database',
                        'schema',
                        'sqlite.schema.ts',
                    ),
                    'utf8',
                );

                const main = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'main.ts',
                    ),
                    'utf8',
                );

                const authModule = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'auth',
                        'auth.module.ts',
                    ),
                    'utf8',
                );

                const sessionStore = await readFile(
                    path.join(
                        targetDir,
                        'src',
                        'auth',
                        'drizzle-session.store.ts',
                    ),
                    'utf8',
                );

                const cleanDatabase = await readFile(
                    path.join(
                        targetDir,
                        'test',
                        'utils',
                        'clean-database.ts',
                    ),
                    'utf8',
                );

                const envExample = await readFile(
                    path.join(
                        targetDir,
                        '.env.example',
                    ),
                    'utf8',
                );

                const packageJson =
                    await fs.readJson(
                        path.join(
                            targetDir,
                            'package.json',
                        ),
                    );

                assert.match(
                    schema,
                    /export const sessions/,
                );

                assert.doesNotMatch(
                    schema,
                    /export const refreshTokens/,
                );

                assert.doesNotMatch(
                    schema,
                    /passwordResetTokens/,
                );

                assert.doesNotMatch(
                    schema,
                    /nestforge:feature/,
                );

                assert.match(
                    main,
                    /DrizzleSessionStore/,
                );

                assert.match(
                    main,
                    /store:\s*sessionStore/,
                );

                assert.doesNotMatch(
                    main,
                    /TypeormStore|PrismaSessionStore|DataSource/,
                );

                assert.match(
                    authModule,
                    /DrizzleSessionStore/,
                );

                assert.match(
                    authModule,
                    /SessionService/,
                );

                assert.match(
                    authModule,
                    /SessionAuthGuard/,
                );

                assert.doesNotMatch(
                    authModule,
                    /JwtModule|JwtStrategy|JwtAuthGuard|TokenService/,
                );

                assert.match(
                    sessionStore,
                    /extends Store/,
                );

                assert.match(
                    sessionStore,
                    /\.onConflictDoUpdate\(/,
                );

                assert.doesNotMatch(
                    sessionStore,
                    /\.onDuplicateKeyUpdate\(/,
                );

                assert.doesNotMatch(
                    sessionStore,
                    /typeorm|TypeOrm|Prisma|connect-typeorm/,
                );

                assert.doesNotMatch(
                    sessionStore,
                    /nestforge:feature/,
                );

                assert.match(
                    cleanDatabase,
                    /\.delete\(sessions\)\.run\(\)/,
                );

                assert.doesNotMatch(
                    cleanDatabase,
                    /async \(transaction\)/,
                );

                assert.match(
                    envExample,
                    /SESSION_SECRET=/,
                );

                assert.match(
                    envExample,
                    /SESSION_MAX_AGE=/,
                );

                assert.doesNotMatch(
                    envExample,
                    /JWT_ACCESS_SECRET=/,
                );

                assert.doesNotMatch(
                    envExample,
                    /JWT_REFRESH_SECRET=/,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'auth',
                            'token.service.ts',
                        ),
                    ),
                    false,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'test',
                            'session-auth.e2e-spec.ts',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'test',
                            'auth.e2e-spec.ts',
                        ),
                    ),
                    false,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'test',
                            'users.e2e-spec.ts',
                        ),
                    ),
                    false,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    'express-session'
                    ],
                    undefined,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    'better-sqlite3'
                    ],
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies[
                    '@nestjs/jwt'
                    ],
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies[
                    'passport-jwt'
                    ],
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies[
                    'connect-typeorm'
                    ],
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies[
                    '@quixo3/prisma-session-store'
                    ],
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies.pg,
                    undefined,
                );

                assert.equal(
                    packageJson.dependencies.mysql2,
                    undefined,
                );
            },
        );
    },
);

test(
    'configura PostgreSQL e MySQL no template Drizzle',
    { concurrency: false },
    async () => {
        const cases = [
            {
                database: 'postgres' as const,
                projectName: 'drizzle-postgres',
                dbType: 'postgres',
                dialect: 'postgresql',
                schemaFile: 'postgres.schema.ts',
                schemaBuilder: 'pgTable',
                driver: 'pg',
                connectionPattern: /new Pool/,
            },
            {
                database: 'mysql' as const,
                projectName: 'drizzle-mysql',
                dbType: 'mysql',
                dialect: 'mysql',
                schemaFile: 'mysql.schema.ts',
                schemaBuilder: 'mysqlTable',
                driver: 'mysql2',
                connectionPattern: /createPool/,
            },
        ];

        for (const testCase of cases) {
            await withGeneratedProject(
                makeOptions({
                    projectName:
                        testCase.projectName,
                    orm: 'drizzle',
                    database:
                        testCase.database,
                    authStrategy: 'jwt',
                    features: [],
                    accessControl: false,
                }),
                async (targetDir) => {
                    const envExample =
                        await readFile(
                            path.join(
                                targetDir,
                                '.env.example',
                            ),
                            'utf8',
                        );

                    const drizzleConfig =
                        await readFile(
                            path.join(
                                targetDir,
                                'drizzle.config.ts',
                            ),
                            'utf8',
                        );

                    const schema =
                        await readFile(
                            path.join(
                                targetDir,
                                'src',
                                'database',
                                'schema',
                                testCase.schemaFile,
                            ),
                            'utf8',
                        );

                    const databaseModule =
                        await readFile(
                            path.join(
                                targetDir,
                                'src',
                                'database',
                                'database.module.ts',
                            ),
                            'utf8',
                        );

                    const packageJson =
                        await fs.readJson(
                            path.join(
                                targetDir,
                                'package.json',
                            ),
                        );

                    assert.match(
                        envExample,
                        new RegExp(
                            `^DB_TYPE=${testCase.dbType}$`,
                            'm',
                        ),
                    );

                    assert.match(
                        drizzleConfig,
                        new RegExp(
                            `dialect:\\s*'${testCase.dialect}'`,
                        ),
                    );

                    assert.match(
                        drizzleConfig,
                        new RegExp(
                            testCase.schemaFile.replace(
                                '.',
                                '\\.',
                            ),
                        ),
                    );

                    assert.doesNotMatch(
                        drizzleConfig,
                        /nestforge:feature/,
                    );

                    assert.match(
                        schema,
                        new RegExp(
                            testCase.schemaBuilder,
                        ),
                    );

                    assert.doesNotMatch(
                        schema,
                        /nestforge:feature/,
                    );

                    assert.match(
                        databaseModule,
                        testCase.connectionPattern,
                    );

                    assert.doesNotMatch(
                        databaseModule,
                        /nestforge:feature/,
                    );

                    assert.notEqual(
                        packageJson.dependencies[
                        testCase.driver
                        ],
                        undefined,
                    );

                    assert.notEqual(
                        packageJson.dependencies[
                        'drizzle-orm'
                        ],
                        undefined,
                    );

                    assert.notEqual(
                        packageJson.devDependencies[
                        'drizzle-kit'
                        ],
                        undefined,
                    );

                    if (
                        testCase.database ===
                        'postgres'
                    ) {
                        assert.equal(
                            packageJson.dependencies
                                .mysql2,
                            undefined,
                        );

                        assert.equal(
                            packageJson.dependencies[
                            'better-sqlite3'
                            ],
                            undefined,
                        );

                        assert.equal(
                            await fs.pathExists(
                                path.join(
                                    targetDir,
                                    'src',
                                    'database',
                                    'schema',
                                    'mysql.schema.ts',
                                ),
                            ),
                            false,
                        );

                        assert.equal(
                            await fs.pathExists(
                                path.join(
                                    targetDir,
                                    'src',
                                    'database',
                                    'schema',
                                    'sqlite.schema.ts',
                                ),
                            ),
                            false,
                        );
                    }

                    if (
                        testCase.database === 'mysql'
                    ) {
                        assert.equal(
                            packageJson.dependencies.pg,
                            undefined,
                        );

                        assert.equal(
                            packageJson.dependencies[
                            'better-sqlite3'
                            ],
                            undefined,
                        );

                        assert.equal(
                            await fs.pathExists(
                                path.join(
                                    targetDir,
                                    'src',
                                    'database',
                                    'schema',
                                    'postgres.schema.ts',
                                ),
                            ),
                            false,
                        );

                        assert.equal(
                            await fs.pathExists(
                                path.join(
                                    targetDir,
                                    'src',
                                    'database',
                                    'schema',
                                    'sqlite.schema.ts',
                                ),
                            ),
                            false,
                        );
                    }
                },
            );
        }
    },
);

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

test(
    'gera projeto TypeORM em JavaScript',
    { concurrency: false },
    async () => {
        await withGeneratedProject(
            makeOptions({
                projectName: 'typeorm-javascript',
                orm: 'typeorm',
                database: 'sqlite',
                language: 'javascript',
                authStrategy: 'jwt',
                features: ['validation'],
                accessControl: false,
            }),
            async (targetDir) => {
                const packageJson = await fs.readJson(
                    path.join(targetDir, 'package.json'),
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(targetDir, 'src', 'main.js'),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(targetDir, 'src', 'main.ts'),
                    ),
                    false,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'data-source.js',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'data-source.ts',
                        ),
                    ),
                    false,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'seed.js',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'seed.ts',
                        ),
                    ),
                    false,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(targetDir, 'prisma'),
                    ),
                    false,
                );

                assert.equal(
                    packageJson.scripts.typeorm,
                    'dotenv -e .env -- typeorm -d src/database/data-source.js',
                );

                assert.equal(
                    packageJson.scripts['pretest:e2e'],
                    'dotenv -e .env.test -- typeorm -d src/database/data-source.js migration:run',
                );

                assert.equal(
                    packageJson.scripts.seed,
                    'dotenv -e .env -- node src/database/seed.js',
                );

                assert.equal(
                    packageJson.scripts['test:e2e'],
                    'dotenv -e .env.test -- vitest run --config ./vitest.e2e.config.js',
                );

                assert.equal(
                    packageJson.prisma,
                    undefined,
                );

                assert.equal(
                    packageJson.scripts['prisma:seed'],
                    undefined,
                );

                assert.equal(
                    packageJson.devDependencies.typescript,
                    undefined,
                );

                assert.equal(
                    packageJson.devDependencies['ts-node'],
                    undefined,
                );

                assert.equal(
                    packageJson.devDependencies[
                    '@types/better-sqlite3'
                    ],
                    undefined,
                );

                assert.notEqual(
                    packageJson.dependencies.typeorm,
                    undefined,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    'better-sqlite3'
                    ],
                    undefined,
                );
            },
        );
    },
);

test(
    'gera projeto Drizzle em JavaScript',
    { concurrency: false },
    async () => {
        await withGeneratedProject(
            makeOptions({
                projectName:
                    'drizzle-javascript',
                orm: 'drizzle',
                database: 'sqlite',
                language: 'javascript',
                authStrategy: 'jwt',
                features: ['validation'],
                accessControl: false,
            }),
            async (targetDir) => {
                const packageJson =
                    await fs.readJson(
                        path.join(
                            targetDir,
                            'package.json',
                        ),
                    );

                const workflow = await readFile(
                    path.join(
                        targetDir,
                        '.github',
                        'workflows',
                        'ci.yml',
                    ),
                    'utf8',
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'main.js',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'main.ts',
                        ),
                    ),
                    false,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'drizzle.config.js',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'drizzle.config.ts',
                        ),
                    ),
                    false,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'schema',
                            'sqlite.schema.js',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'schema',
                            'sqlite.schema.ts',
                        ),
                    ),
                    false,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'seed.js',
                        ),
                    ),
                    true,
                );

                assert.equal(
                    await fs.pathExists(
                        path.join(
                            targetDir,
                            'src',
                            'database',
                            'seed.ts',
                        ),
                    ),
                    false,
                );

                assert.equal(
                    packageJson.scripts[
                    'drizzle:generate'
                    ],
                    'dotenv -e .env -- drizzle-kit generate --config=drizzle.config.js',
                );

                assert.equal(
                    packageJson.scripts[
                    'drizzle:migrate'
                    ],
                    'dotenv -e .env -- drizzle-kit migrate --config=drizzle.config.js',
                );

                assert.equal(
                    packageJson.scripts[
                    'pretest:e2e'
                    ],
                    'dotenv -e .env.test -- drizzle-kit migrate --config=drizzle.config.js',
                );

                assert.equal(
                    packageJson.scripts.seed,
                    'dotenv -e .env -- node src/database/seed.js',
                );

                assert.equal(
                    packageJson.scripts[
                    'test:e2e'
                    ],
                    'dotenv -e .env.test -- vitest run --config ./vitest.e2e.config.js',
                );

                assert.equal(
                    packageJson.devDependencies
                        .typescript,
                    undefined,
                );

                assert.equal(
                    packageJson.devDependencies[
                    'ts-node'
                    ],
                    undefined,
                );

                assert.equal(
                    packageJson.devDependencies[
                    '@types/better-sqlite3'
                    ],
                    undefined,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    'better-sqlite3'
                    ],
                    undefined,
                );

                assert.notEqual(
                    packageJson.dependencies[
                    'drizzle-orm'
                    ],
                    undefined,
                );

                assert.notEqual(
                    packageJson.devDependencies[
                    'drizzle-kit'
                    ],
                    undefined,
                );

                assert.match(
                    workflow,
                    /drizzle-kit generate --config=drizzle\.config\.js/,
                );

                assert.match(
                    workflow,
                    /drizzle-kit migrate --config=drizzle\.config\.js/,
                );

                assert.doesNotMatch(
                    workflow,
                    /drizzle\.config\.ts/,
                );
            },
        );
    },
);

test('gera Prisma com MongoDB e autenticação JWT', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'prisma-mongodb',
            orm: 'prisma',
            database: 'mongodb',
            features: ['docker', 'swagger', 'validation'],
            authStrategy: 'jwt',
            accessControl: true,
        }),
        async (targetDir) => {
            const packageJson = await fs.readJson(path.join(targetDir, 'package.json'));
            const schema = await readFile(
                path.join(targetDir, 'prisma', 'schema.prisma'),
                'utf8',
            );
            const envExample = await readFile(path.join(targetDir, '.env.example'), 'utf8');
            const envTest = await readFile(path.join(targetDir, '.env.test'), 'utf8');
            const compose = await readFile(path.join(targetDir, 'docker-compose.yml'), 'utf8');
            const workflow = await readFile(
                path.join(targetDir, '.github', 'workflows', 'ci.yml'),
                'utf8',
            );
            const readme = await readFile(path.join(targetDir, 'README.md'), 'utf8');
            const addingModuleGuide = await readFile(
                path.join(targetDir, 'docs', 'adding-a-module.md'),
                'utf8',
            );

            assert.match(schema, /provider\s*=\s*"mongodb"/);
            assert.equal(
                schema.match(/@default\(auto\(\)\) @map\("_id"\) @db\.ObjectId/g)?.length,
                5,
            );
            assert.equal(schema.match(/userId\s+String @db\.ObjectId/g)?.length, 4);
            assert.doesNotMatch(schema, /@db\.Text|model Session/);
            assert.match(
                envExample,
                /DATABASE_URL="mongodb:\/\/localhost:27017\/nestforge\?replicaSet=rs0"/,
            );
            assert.match(envTest, /mongodb:\/\/localhost:27017\/nestforge_test\?replicaSet=rs0/);
            assert.equal(packageJson.scripts['prisma:push'], 'prisma db push');
            assert.equal(packageJson.scripts['prisma:migrate'], undefined);
            assert.equal(packageJson.scripts['prisma:deploy'], undefined);
            assert.equal(packageJson.dependencies.pg, undefined);
            assert.equal(packageJson.dependencies.mysql2, undefined);
            assert.equal(packageJson.dependencies['better-sqlite3'], undefined);
            assert.match(compose, /^\s{2}mongodb:/m);
            assert.doesNotMatch(compose, /^\s{2}(postgres|mysql):/m);
            assert.match(workflow, /Start MongoDB replica set/);
            assert.match(workflow, /npx prisma db push/);
            assert.doesNotMatch(workflow, /prisma migrate deploy/);
            assert.match(readme, /npm run prisma:push/);
            assert.doesNotMatch(readme, /npx prisma migrate dev/);
            assert.match(
                addingModuleGuide,
                /@default\(auto\(\)\) @map\("_id"\) @db\.ObjectId/,
            );
            assert.doesNotMatch(addingModuleGuide, /@default\(uuid\(\)\)|nestforge:feature/);
        },
    );
});

test('gera Prisma com MongoDB e Session/Cookies', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'prisma-mongodb-session',
            orm: 'prisma',
            database: 'mongodb',
            features: ['validation'],
            authStrategy: 'session',
            accessControl: true,
        }),
        async (targetDir) => {
            const packageJson = await fs.readJson(path.join(targetDir, 'package.json'));
            const schema = await readFile(
                path.join(targetDir, 'prisma', 'schema.prisma'),
                'utf8',
            );

            assert.match(schema, /model Session \{/);
            assert.match(schema, /id\s+String @id @map\("_id"\)/);
            assert.match(schema, /sid String @unique/);
            assert.match(schema, /data String/);
            assert.doesNotMatch(schema, /id\s+String @id @map\("_id"\) @db\.ObjectId\s+sid/);
            assert.notEqual(packageJson.dependencies['@quixo3/prisma-session-store'], undefined);
            assert.notEqual(packageJson.dependencies['express-session'], undefined);
            assert.equal(packageJson.dependencies['@nestjs/jwt'], undefined);
        },
    );
});

test('gera Prisma com MongoDB em JavaScript', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'prisma-mongodb-javascript',
            language: 'javascript',
            orm: 'prisma',
            database: 'mongodb',
            features: ['validation'],
            authStrategy: 'jwt',
        }),
        async (targetDir) => {
            const packageJson = await fs.readJson(path.join(targetDir, 'package.json'));
            const schema = await readFile(
                path.join(targetDir, 'prisma', 'schema.prisma'),
                'utf8',
            );
            const generatedFiles = await listFilesRecursively(targetDir);

            assert.equal(generatedFiles.some((file) => file.endsWith('.ts')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'main.js')), true);
            assert.equal(await fs.pathExists(path.join(targetDir, 'prisma', 'seed.js')), true);
            assert.match(schema, /provider\s*=\s*"mongodb"/);
            assert.equal(packageJson.scripts['prisma:push'], 'prisma db push');
            assert.equal(packageJson.scripts['prisma:seed'], 'node prisma/seed.js');
            assert.equal(
                packageJson.scripts['test:e2e'],
                'dotenv -e .env.test -- vitest run --config ./vitest.e2e.config.js',
            );
        },
    );
});

test('gera projeto TypeScript sem ORM, banco ou autenticação', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'no-orm-typescript',
            orm: 'none',
            database: 'none',
            features: [],
            authStrategy: 'none',
            accessControl: false,
            createEnv: true,
        }),
        async (targetDir) => {
            const packageJson = await fs.readJson(path.join(targetDir, 'package.json'));
            const appModule = await readFile(path.join(targetDir, 'src', 'app.module.ts'), 'utf8');
            const healthController = await readFile(
                path.join(targetDir, 'src', 'health', 'health.controller.ts'),
                'utf8',
            );
            const envExample = await readFile(path.join(targetDir, '.env.example'), 'utf8');
            const readme = await readFile(path.join(targetDir, 'README.md'), 'utf8');

            assert.equal(await fs.pathExists(path.join(targetDir, 'prisma')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'database')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'auth')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'users')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'Dockerfile')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'docker-compose.yml')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'mail')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, '.env')), true);
            assert.equal(
                await fs.pathExists(path.join(targetDir, 'src', 'config', 'env.validation.spec.ts')),
                true,
            );
            assert.equal(
                await fs.pathExists(path.join(targetDir, 'test', 'app.e2e-spec.ts')),
                true,
            );

            assert.equal(packageJson.dependencies['@prisma/client'], undefined);
            assert.equal(packageJson.devDependencies.prisma, undefined);
            assert.equal(packageJson.scripts['prisma:generate'], undefined);
            assert.equal(packageJson.scripts['pretest:e2e'], undefined);
            assert.doesNotMatch(appModule, /Prisma|database/i);
            assert.doesNotMatch(healthController, /Prisma|database/i);
            assert.doesNotMatch(envExample, /DATABASE_URL|JWT_|SESSION_|OAUTH/i);
            assert.match(readme, /^# no-orm-typescript/m);
            assert.doesNotMatch(readme, /Prisma|TypeORM|Drizzle/i);
        },
    );
});

test('gera projeto JavaScript sem ORM com Docker e Redis', { concurrency: false }, async () => {
    await withGeneratedProject(
        makeOptions({
            projectName: 'no-orm-javascript',
            language: 'javascript',
            orm: 'none',
            database: 'none',
            features: ['docker', 'swagger', 'validation', 'redis'],
            authStrategy: 'none',
            accessControl: false,
        }),
        async (targetDir) => {
            const packageJson = await fs.readJson(path.join(targetDir, 'package.json'));
            const dockerfile = await readFile(path.join(targetDir, 'Dockerfile'), 'utf8');
            const compose = await readFile(path.join(targetDir, 'docker-compose.yml'), 'utf8');
            const workflow = await readFile(
                path.join(targetDir, '.github', 'workflows', 'ci.yml'),
                'utf8',
            );
            const vitestConfig = await readFile(
                path.join(targetDir, 'vitest.config.js'),
                'utf8',
            );
            const vitestE2eConfig = await readFile(
                path.join(targetDir, 'vitest.e2e.config.js'),
                'utf8',
            );
            const unitTest = await readFile(
                path.join(targetDir, 'src', 'config', 'env.validation.spec.js'),
                'utf8',
            );
            const e2eTest = await readFile(
                path.join(targetDir, 'test', 'app.e2e-spec.js'),
                'utf8',
            );
            const generatedFiles = await listFilesRecursively(targetDir);

            assert.equal(generatedFiles.some((file) => file.endsWith('.ts')), false);
            assert.equal(await fs.pathExists(path.join(targetDir, 'src', 'main.js')), true);
            assert.equal(await fs.pathExists(path.join(targetDir, 'test', 'app.e2e-spec.js')), true);
            assert.match(compose, /^\s{2}redis:/m);
            assert.doesNotMatch(compose, /^\s{2}(postgres|mysql):/m);
            assert.doesNotMatch(dockerfile, /Prisma|prisma|database/);
            assert.doesNotMatch(workflow, /Prisma|prisma|DATABASE_URL/);
            assert.notEqual(packageJson.dependencies['@nestjs/bullmq'], undefined);
            assert.equal(packageJson.dependencies['@prisma/client'], undefined);
            assert.equal(packageJson.devDependencies.typescript, undefined);
            assert.match(vitestConfig, /src\/\*\*\/\*\.spec\.js/);
            assert.doesNotMatch(vitestConfig, /\.ts/);
            assert.match(vitestE2eConfig, /test\/\*\*\/\*\.e2e-spec\.js/);
            assert.doesNotMatch(vitestE2eConfig, /\.ts/);
            assert.match(unitTest, /import \{ describe, expect, it \} from 'vitest'/);
            assert.doesNotMatch(unitTest, /require\(["']vitest["']\)/);
            assert.match(e2eTest, /import \{ afterAll, beforeAll, describe, expect, it \} from 'vitest'/);
            assert.doesNotMatch(e2eTest, /require\(["']vitest["']\)/);
            assert.equal(
                packageJson.scripts['test:e2e'],
                'dotenv -e .env.test -- vitest run --config ./vitest.e2e.config.js',
            );
        },
    );
});

test('recusa opções ainda não implementadas sem criar projeto', { concurrency: false }, async () => {
    const unsupportedOptions: Array<
        [string, Partial<ProjectOptions>]
    > = [
            [
                'TypeORM-MongoDB',
                {
                    orm: 'typeorm',
                    database: 'mongodb',
                },
            ],
            [
                'Drizzle-MongoDB',
                {
                    orm: 'drizzle',
                    database: 'mongodb',
                },
            ],
            [
                'ORM-none-with-database',
                {
                    orm: 'none',
                    database: 'postgres',
                    authStrategy: 'none',
                    accessControl: false,
                },
            ],
            [
                'ORM-none-with-auth',
                {
                    orm: 'none',
                    database: 'none',
                    authStrategy: 'jwt',
                    accessControl: false,
                },
            ],
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
});

test('accepts valid project and npm package names', () => {
    const validNames = [
        'api',
        'my-nest-api',
        'api_v2',
        'api.core',
        '2026-api',
    ];

    for (const projectName of validNames) {
        assert.equal(validateProjectName(projectName), undefined);
    }
});

test('rejects invalid, unsafe, and reserved project names', () => {
    const invalidNames: Array<[string, RegExp]> = [
        ['', /required/],
        [' my-api', /whitespace/],
        ['my-api ', /whitespace/],
        ['MyApi', /lowercase/],
        ['../my-api', /path separators/],
        ['my\\api', /path separators/],
        ['@scope/my-api', /Scoped package names/],
        ['my api', /contain only lowercase/],
        ['.my-api', /start with a letter or number/],
        ['my-api.', /end with a dot/],
        ['node_modules', /reserved/],
        ['favicon.ico', /reserved/],
        ['con', /reserved name on Windows/],
        ['con.txt', /reserved name on Windows/],
        ['lpt9', /reserved name on Windows/],
        ['a'.repeat(215), /214 characters/],
        ['aplicação', /contain only lowercase/],
    ];

    for (const [projectName, expectedMessage] of invalidNames) {
        assert.match(validateProjectName(projectName) ?? '', expectedMessage);
    }
});

test('rejects invalid project names before creating files', { concurrency: false }, async () => {
    await withTempDirectory(async (tempDir) => {
        const invalidNames = [
            '../outside-project',
            path.resolve(tempDir, 'absolute-project'),
            'Invalid Project',
            'node_modules',
        ];

        for (const projectName of invalidNames) {
            await assert.rejects(
                () => generateProject(makeOptions({ projectName })),
                /Invalid project name:/,
            );
        }

        assert.deepEqual(await fs.readdir(tempDir), []);
    });
});

test('does not overwrite an existing project directory', { concurrency: false }, async () => {
    await withTempDirectory(async (tempDir) => {
        const projectName = 'existing-project';
        const sentinelPath = path.join(tempDir, projectName, 'keep.txt');
        await fs.outputFile(sentinelPath, 'keep this file');

        await assert.rejects(
            () => generateProject(makeOptions({ projectName })),
            /directory already exists/,
        );

        assert.equal(await fs.readFile(sentinelPath, 'utf8'), 'keep this file');
    });
});
