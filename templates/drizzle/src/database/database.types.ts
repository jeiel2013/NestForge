import * as schema from './schema';

// nestforge:feature:database:postgres
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

export type DatabaseClient = Pool;
export type DrizzleDatabase =
    NodePgDatabase<typeof schema>;
// nestforge:feature:database:postgres:end

// nestforge:feature:database:mysql
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { Pool as MySqlPool } from 'mysql2/promise';

export type DatabaseClient = MySqlPool;
export type DrizzleDatabase =
    MySql2Database<typeof schema>;
// nestforge:feature:database:mysql:end

// nestforge:feature:database:sqlite
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';

export type DatabaseClient = BetterSqlite3.Database;
export type DrizzleDatabase =
    BetterSQLite3Database<typeof schema>;
// nestforge:feature:database:sqlite:end