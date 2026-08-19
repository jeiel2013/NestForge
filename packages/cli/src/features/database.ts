import fs from 'fs-extra';
import path from 'node:path';

type DatabaseChoice = 'postgres' | 'mysql' | 'sqlite';

interface DatabaseUrlConfig {
    provider: 'postgresql' | 'mysql' | 'sqlite';
    devUrl: string;
    testUrl: string;
}

const DATABASE_CONFIG: Record<DatabaseChoice, DatabaseUrlConfig> = {
    postgres: {
        provider: 'postgresql',
        devUrl: 'postgresql://nestforge:nestforge@localhost:5432/nestforge?schema=public',
        testUrl: 'postgresql://nestforge:nestforge@localhost:5432/nestforge_test?schema=public',
    },
    mysql: {
        provider: 'mysql',
        devUrl: 'mysql://nestforge:nestforge@localhost:3306/nestforge',
        testUrl: 'mysql://nestforge:nestforge@localhost:3306/nestforge_test',
    },
    sqlite: {
        provider: 'sqlite',
        devUrl: 'file:./dev.db',
        testUrl: 'file:./test.db',
    },
};

/**
 * Ajusta o schema.prisma (datasource provider) e as DATABASE_URL do .env.example
 * e .env.test pro banco escolhido. Roda antes dos marcadores de feature, já que
 * mexe em conteúdo (substituição de valor), não em presença/ausência de bloco.
 */
export async function applyDatabaseConfig(targetDir: string, database: string): Promise<void> {
    const config = DATABASE_CONFIG[database as DatabaseChoice];
    if (!config) return;

    await updateSchemaProvider(targetDir, config.provider);
    await updateDatabaseUrl(targetDir, '.env.example', config.devUrl);
    await updateDatabaseUrl(targetDir, '.env.test', config.testUrl);
}

async function updateSchemaProvider(
    targetDir: string,
    provider: DatabaseUrlConfig['provider'],
): Promise<void> {
    const schemaPath = path.join(targetDir, 'prisma', 'schema.prisma');
    if (!(await fs.pathExists(schemaPath))) return;

    const content = await fs.readFile(schemaPath, 'utf-8');
    const updated = content.replace(/provider\s*=\s*"[^"]+"/, `provider = "${provider}"`);
    await fs.writeFile(schemaPath, updated, 'utf-8');
}

async function updateDatabaseUrl(targetDir: string, fileName: string, url: string): Promise<void> {
    const filePath = path.join(targetDir, fileName);
    if (!(await fs.pathExists(filePath))) return;

    const content = await fs.readFile(filePath, 'utf-8');
    const updated = content.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${url}"`);
    await fs.writeFile(filePath, updated, 'utf-8');
}