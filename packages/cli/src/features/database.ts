import fs from 'fs-extra';
import path from 'node:path';

type DatabaseChoice =
    | 'postgres'
    | 'mysql'
    | 'sqlite'
    | 'mongodb';

interface DatabaseUrlConfig {
    provider: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
    devUrl: string;
    testUrl: string;
}

const DATABASE_CONFIG: Record<
    DatabaseChoice,
    DatabaseUrlConfig
> = {
    postgres: {
        provider: 'postgresql',
        devUrl:
            'postgresql://nestforge:nestforge@localhost:5432/nestforge?schema=public',
        testUrl:
            'postgresql://nestforge:nestforge@localhost:5432/nestforge_test?schema=public',
    },
    mysql: {
        provider: 'mysql',
        devUrl:
            'mysql://nestforge:nestforge@localhost:3306/nestforge',
        testUrl:
            'mysql://nestforge:nestforge@localhost:3306/nestforge_test',
    },
    sqlite: {
        provider: 'sqlite',
        devUrl: 'file:./dev.db',
        testUrl: 'file:./test.db',
    },
    mongodb: {
        provider: 'mongodb',
        devUrl:
            'mongodb://localhost:27017/nestforge?replicaSet=rs0',
        testUrl:
            'mongodb://localhost:27017/nestforge_test?replicaSet=rs0',
    },
};

export async function applyDatabaseConfig(
    targetDir: string,
    database: string,
): Promise<void> {
    const databaseChoice =
        database as DatabaseChoice;

    const config =
        DATABASE_CONFIG[databaseChoice];

    if (!config) {
        return;
    }

    await updateSchemaProvider(
        targetDir,
        config.provider,
    );

    if (databaseChoice === 'mongodb') {
        await updateMongoSchema(targetDir);
        await updateMongoScripts(targetDir);
    }

    await updateDatabaseType(
        targetDir,
        '.env.example',
        databaseChoice,
    );

    await updateDatabaseType(
        targetDir,
        '.env.test',
        databaseChoice,
    );

    await updateDatabaseUrl(
        targetDir,
        '.env.example',
        config.devUrl,
    );

    await updateDatabaseUrl(
        targetDir,
        '.env.test',
        config.testUrl,
    );
}

async function updateSchemaProvider(
    targetDir: string,
    provider: DatabaseUrlConfig['provider'],
): Promise<void> {
    const schemaPath = path.join(
        targetDir,
        'prisma',
        'schema.prisma',
    );

    if (!(await fs.pathExists(schemaPath))) {
        return;
    }

    const content = await fs.readFile(
        schemaPath,
        'utf-8',
    );

    const updated = content.replace(
        /(datasource\s+db\s*\{[^}]*provider\s*=\s*)"[^"]+"/,
        `$1"${provider}"`,
    );

    await fs.writeFile(
        schemaPath,
        updated,
        'utf-8',
    );
}

async function updateDatabaseType(
    targetDir: string,
    fileName: string,
    database: DatabaseChoice,
): Promise<void> {
    const filePath = path.join(
        targetDir,
        fileName,
    );

    if (!(await fs.pathExists(filePath))) {
        return;
    }

    const content = await fs.readFile(
        filePath,
        'utf-8',
    );

    const updated = content.replace(
        /^DB_TYPE=.*$/m,
        `DB_TYPE=${database}`,
    );

    await fs.writeFile(
        filePath,
        updated,
        'utf-8',
    );
}

async function updateDatabaseUrl(
    targetDir: string,
    fileName: string,
    url: string,
): Promise<void> {
    const filePath = path.join(
        targetDir,
        fileName,
    );

    if (!(await fs.pathExists(filePath))) {
        return;
    }

    const content = await fs.readFile(
        filePath,
        'utf-8',
    );

    const updated = content.replace(
        /^DATABASE_URL=.*$/m,
        `DATABASE_URL="${url}"`,
    );

    await fs.writeFile(
        filePath,
        updated,
        'utf-8',
    );
}

async function updateMongoScripts(
    targetDir: string,
): Promise<void> {
    const packageJsonPath = path.join(
        targetDir,
        'package.json',
    );

    if (!(await fs.pathExists(packageJsonPath))) {
        return;
    }

    const packageJson = await fs.readJson(
        packageJsonPath,
    );

    packageJson.scripts['prisma:push'] =
        'prisma db push';
    packageJson.scripts['pretest:e2e'] =
        'dotenv -e .env.test -- npx prisma db push --skip-generate';

    delete packageJson.scripts['prisma:migrate'];
    delete packageJson.scripts['prisma:deploy'];

    await fs.writeJson(
        packageJsonPath,
        packageJson,
        { spaces: 2 },
    );
}

async function updateMongoSchema(
    targetDir: string,
): Promise<void> {
    const schemaPath = path.join(
        targetDir,
        'prisma',
        'schema.prisma',
    );

    if (!(await fs.pathExists(schemaPath))) {
        return;
    }

    const schema = await fs.readFile(
        schemaPath,
        'utf8',
    );

    const updated = schema
        .replaceAll(
            '@id @default(uuid())',
            '@id @default(auto()) @map("_id") @db.ObjectId',
        )
        .replace(
            /id\s+String\s+@id\r?\n\s+sid String @unique/,
            'id  String @id @map("_id")\n  sid String @unique',
        )
        .replace(
            /userId(\s+)String(?!\s+@db\.ObjectId)/g,
            'userId$1String @db.ObjectId',
        );

    await fs.writeFile(
        schemaPath,
        updated,
        'utf8',
    );
}
