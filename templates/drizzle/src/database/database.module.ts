import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';
import {
    DATABASE_CLIENT,
    DRIZZLE_DATABASE,
} from './database.constants';
import {
    DatabaseClient,
    DrizzleDatabase,
} from './database.types';
import { DatabaseLifecycleService } from './database-lifecycle.service';

// nestforge:feature:database:postgres
import { Pool } from 'pg';
import { drizzle as createDrizzle } from 'drizzle-orm/node-postgres';
// nestforge:feature:database:postgres:end

// nestforge:feature:database:mysql
import { createPool } from 'mysql2/promise';
import { drizzle as createDrizzle } from 'drizzle-orm/mysql2';
// nestforge:feature:database:mysql:end

// nestforge:feature:database:sqlite
import BetterSqlite3 from 'better-sqlite3';
import { drizzle as createDrizzle } from 'drizzle-orm/better-sqlite3';
// nestforge:feature:database:sqlite:end

@Global()
@Module({
    providers: [
        {
            provide: DATABASE_CLIENT,
            inject: [ConfigService],
            useFactory: (
                configService: ConfigService,
            ): DatabaseClient => {
                const databaseUrl =
                    configService.getOrThrow<string>(
                        'DATABASE_URL',
                    );

                // nestforge:feature:database:postgres
                return new Pool({
                    connectionString: databaseUrl,
                });
                // nestforge:feature:database:postgres:end

                // nestforge:feature:database:mysql
                return createPool(databaseUrl);
                // nestforge:feature:database:mysql:end

                // nestforge:feature:database:sqlite
                const databasePath = databaseUrl.replace(
                    /^file:/,
                    '',
                );

                return new BetterSqlite3(databasePath);
                // nestforge:feature:database:sqlite:end
            },
        },
        {
            provide: DRIZZLE_DATABASE,
            inject: [DATABASE_CLIENT],
            useFactory: (
                client: DatabaseClient,
            ): DrizzleDatabase => {
                // nestforge:feature:database:postgres
                return createDrizzle(client, {
                    schema,
                });
                // nestforge:feature:database:postgres:end

                // nestforge:feature:database:mysql
                return createDrizzle(client, {
                    schema,
                    mode: 'default',
                });
                // nestforge:feature:database:mysql:end

                // nestforge:feature:database:sqlite
                return createDrizzle(client, {
                    schema,
                });
                // nestforge:feature:database:sqlite:end
            },
        },
        DatabaseLifecycleService,
    ],
    exports: [
        DATABASE_CLIENT,
        DRIZZLE_DATABASE,
    ],
})
export class DatabaseModule { }