import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';

export type DatabaseType = 'postgres' | 'mysql' | 'sqlite';

export function createTypeOrmOptions(
    databaseType: DatabaseType,
    databaseUrl: string,
): DataSourceOptions {
    const commonOptions = {
        entities: [
            join(__dirname, '..', '**', '*.entity.{ts,js}'),
        ],
        migrations: [
            join(__dirname, 'migrations', '*.{ts,js}'),
        ],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
    };

    switch (databaseType) {
        case 'postgres':
            return {
                ...commonOptions,
                type: 'postgres',
                url: databaseUrl,
            };

        case 'mysql':
            return {
                ...commonOptions,
                type: 'mysql',
                url: databaseUrl,
            };

        case 'sqlite':
            return {
                ...commonOptions,
                type: 'better-sqlite3',
                database: databaseUrl.replace(/^file:/, ''),
            };

        default:
            throw new Error(
                `Database "${databaseType}" is not supported by the TypeORM template`,
            );
    }
}
