import fs from 'fs-extra';
import path from 'node:path';

const ORM_PATHS = [
    'prisma',
    'src/database',
    'src/health/indicators/prisma-health.indicator.ts',
    'src/health/indicators/prisma-health.indicator.spec.ts',
    'src/common/utils/avatar-storage.util.ts',
    'src/common/utils/hash.util.ts',
    'test/utils/clean-database.ts',
    'docs',
    'ARCHITECTURE.md',
    'ARCHITECTURE.pt-BR.md',
    'ROADMAP.md',
    'ROADMAP.pt-BR.md',
    'TESTING.md',
    'TESTING.pt-BR.md',
];

const AUTH_PACKAGES = [
    '@nestjs/jwt',
    '@nestjs/passport',
    '@quixo3/prisma-session-store',
    '@prisma/client',
    'bcryptjs',
    'express-session',
    'multer',
    'passport',
    'passport-github2',
    'passport-google-oauth20',
    'passport-jwt',
    '@types/bcryptjs',
    '@types/express-session',
    '@types/multer',
    '@types/passport-github2',
    '@types/passport-google-oauth20',
    '@types/passport-jwt',
    'prisma',
    'ts-node',
];

export async function applyNoOrmTransform(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    for (const relativePath of ORM_PATHS) {
        await fs.remove(path.join(targetDir, relativePath));
    }

    await updatePackageJson(targetDir);
    await writeApplicationModule(targetDir, enabledFeatures);
    await writeHealthFiles(targetDir, enabledFeatures);
    await writeEnvironmentFiles(targetDir);
    await writeDockerFiles(targetDir, enabledFeatures);
    await writeCiWorkflow(targetDir, enabledFeatures);
    await writeReadmes(targetDir, enabledFeatures);
    await writeDatabaseFreeTests(targetDir);
}

async function updatePackageJson(targetDir: string): Promise<void> {
    const packagePath = path.join(targetDir, 'package.json');
    const packageJson = await fs.readJson(packagePath);

    packageJson.description =
        'Production-ready NestJS starter without an ORM or database integration.';

    delete packageJson.prisma;
    delete packageJson.scripts['pretest:e2e'];

    for (const scriptName of Object.keys(packageJson.scripts)) {
        if (scriptName.startsWith('prisma:')) {
            delete packageJson.scripts[scriptName];
        }
    }

    for (const packageName of AUTH_PACKAGES) {
        delete packageJson.dependencies?.[packageName];
        delete packageJson.devDependencies?.[packageName];
    }

    packageJson.devDependencies['@types/express'] ??= '^5.0.0';

    await fs.writeJson(packagePath, packageJson, { spaces: 2 });
}

async function writeApplicationModule(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    const redisEnabled = enabledFeatures.has('redis');
    const redisImport = redisEnabled
        ? "import { BullModule } from '@nestjs/bullmq';\nimport { MailModule } from './mail/mail.module';\n"
        : '';
    const redisModules = redisEnabled
        ? `
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    MailModule,`
        : '';

    await writeText(
        targetDir,
        'src/app.module.ts',
        `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
${redisImport}import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL ?? 60) * 1000,
        limit: Number(process.env.THROTTLE_LIMIT ?? 100),
      },
    ]),${redisModules}
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule {}
`,
    );
}

async function writeHealthFiles(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    const redisEnabled = enabledFeatures.has('redis');
    const redisImport = redisEnabled
        ? "import { RedisHealthIndicator } from './indicators/redis-health.indicator';\n"
        : '';
    const redisConstructor = redisEnabled
        ? '        private readonly redisIndicator: RedisHealthIndicator,\n'
        : '';
    const redisCheck = redisEnabled
        ? "            () => this.redisIndicator.isHealthy('redis'),\n"
        : '';
    const redisProvider = redisEnabled ? '        RedisHealthIndicator,\n' : '';

    await writeText(
        targetDir,
        'src/health/health.controller.ts',
        `import { Controller, Get } from '@nestjs/common';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
} from '@nestjs/terminus';
${redisImport}import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
${redisConstructor}        private readonly memory: MemoryHealthIndicator,
        private readonly disk: DiskHealthIndicator,
    ) {}

    @Public()
    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
${redisCheck}            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
            () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
        ]);
    }
}
`,
    );

    await writeText(
        targetDir,
        'src/health/health.module.ts',
        `import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
${redisImport}
@Module({
    imports: [TerminusModule],
    controllers: [HealthController],
    providers: [
${redisProvider}    ],
})
export class HealthModule {}
`,
    );
}

async function writeEnvironmentFiles(targetDir: string): Promise<void> {
    await writeText(
        targetDir,
        '.env.example',
        `# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Mail (Mailpit in development)
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM="NestForge <no-reply@nestforge.dev>"

# Rate limit
THROTTLE_TTL=60
THROTTLE_LIMIT=100
`,
    );

    await writeText(
        targetDir,
        '.env.test',
        `NODE_ENV=test
PORT=3000
APP_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173

REDIS_HOST=localhost
REDIS_PORT=6379

MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM="NestForge <no-reply@nestforge.dev>"

THROTTLE_TTL=60
THROTTLE_LIMIT=1000
`,
    );

    await writeText(
        targetDir,
        'src/config/env.validation.ts',
        `import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().url().default('http://localhost:3000'),
  CORS_ORIGINS: z.string().min(1).default('http://localhost:5173'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  MAIL_HOST: z.string().default('localhost'),
  MAIL_PORT: z.coerce.number().default(1025),
  MAIL_FROM: z.string().default('NestForge <no-reply@nestforge.dev>'),
  THROTTLE_TTL: z.coerce.number().default(60),
  THROTTLE_LIMIT: z.coerce.number().default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => \`${'${issue.path.join(\'.\')}: ${issue.message}'}\`)
      .join('\\n');
    throw new Error(\`Invalid environment variables:\\n${'${issues}'}\`);
  }

  return parsed.data;
}
`,
    );
}

async function writeDockerFiles(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    const dockerfilePath = path.join(targetDir, 'Dockerfile');
    if (!(await fs.pathExists(dockerfilePath))) return;

    await fs.writeFile(
        dockerfilePath,
        `# --- Base ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Dependencies ---
FROM base AS deps
RUN npm ci

# --- Development ---
FROM deps AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# --- Build ---
FROM deps AS build
COPY . .
RUN npm run build
RUN npm prune --production

# --- Production ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
`,
        'utf-8',
    );

    const redisEnabled = enabledFeatures.has('redis');
    const dependsOn = redisEnabled
        ? `    depends_on:
      - redis
`
        : '';
    const redisServices = redisEnabled
        ? `
  redis:
    image: redis:7-alpine
    container_name: nestforge-redis
    restart: unless-stopped
    ports:
      - "6379:6379"

  mailpit:
    image: axllent/mailpit:latest
    container_name: nestforge-mailpit
    restart: unless-stopped
    ports:
      - "8025:8025"
      - "1025:1025"
`
        : '';

    await writeText(
        targetDir,
        'docker-compose.yml',
        `services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nestforge-api
    ports:
      - "3000:3000"
    env_file:
      - .env
${dependsOn}    volumes:
      - ./src:/app/src
    command: npm run start:dev
${redisServices}`,
    );
}

async function writeCiWorkflow(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    const redisEnabled = enabledFeatures.has('redis');
    const redisService = redisEnabled
        ? `
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
`
        : '';

    await writeText(
        targetDir,
        '.github/workflows/ci.yml',
        `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-test-lint:
    runs-on: ubuntu-latest
${redisService}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Unit tests
        run: npm test

      - name: End-to-end tests
        run: npm run test:e2e
`,
    );
}

async function writeReadmes(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    const english = ['health checks', 'metrics', 'structured logging', 'rate limiting'];
    const portuguese = [
        'verificações de saúde',
        'métricas',
        'logs estruturados',
        'limitação de requisições',
    ];

    if (enabledFeatures.has('docker')) {
        english.push('Docker');
        portuguese.push('Docker');
    }

    if (enabledFeatures.has('swagger')) {
        english.push('Swagger/OpenAPI');
        portuguese.push('Swagger/OpenAPI');
    }

    if (enabledFeatures.has('validation')) {
        english.push('global Zod validation');
        portuguese.push('validação global com Zod');
    }

    if (enabledFeatures.has('redis')) {
        english.push('Redis, BullMQ, and email');
        portuguese.push('Redis, BullMQ e e-mail');
    }

    const englishFeatures = english.map((feature) => `- ${feature}`).join('\n');
    const portugueseFeatures = portuguese.map((feature) => `- ${feature}`).join('\n');

    await writeText(
        targetDir,
        'README.md',
        `# NestForge

**English** | [Português](README.pt-BR.md)

NestJS starter generated without an ORM, database integration, or authentication.

## Included features

${englishFeatures}

## Getting started

\`\`\`bash
npm install
cp .env.example .env
npm run start:dev
\`\`\`

## Tests

\`\`\`bash
npm test
npm run test:e2e
\`\`\`
`,
    );

    await writeText(
        targetDir,
        'README.pt-BR.md',
        `# NestForge

[English](README.md) | **Português**

Starter NestJS gerado sem ORM, integração com banco de dados ou autenticação.

## Recursos incluídos

${portugueseFeatures}

## Primeiros passos

\`\`\`bash
npm install
cp .env.example .env
npm run start:dev
\`\`\`

## Testes

\`\`\`bash
npm test
npm run test:e2e
\`\`\`
`,
    );
}

async function writeDatabaseFreeTests(targetDir: string): Promise<void> {
    await writeText(
        targetDir,
        'src/config/env.validation.spec.ts',
        `import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('uses safe defaults without requiring database variables', () => {
    const config = validateEnv({ NODE_ENV: 'test' });

    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(3000);
    expect(config).not.toHaveProperty('DATABASE_URL');
  });
});
`,
    );

    await writeText(
        targetDir,
        'test/app.e2e-spec.ts',
        `import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp } from './utils/e2e-setup';

describe('Application (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes application metrics without a database', async () => {
    const response = await request(app.getHttpServer())
      .get('/metrics')
      .expect(200);

    expect(response.text).toContain('# HELP');
  });
});
`,
    );
}

async function writeText(
    targetDir: string,
    relativePath: string,
    content: string,
): Promise<void> {
    const filePath = path.join(targetDir, relativePath);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
}
