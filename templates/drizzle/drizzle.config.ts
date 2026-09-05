import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
}

// nestforge:feature:database:postgres
export default defineConfig({
    dialect: 'postgresql',
    schema:
        './src/database/schema/postgres.schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: databaseUrl,
    },
    verbose: true,
    strict: true,
});
// nestforge:feature:database:postgres:end

// nestforge:feature:database:mysql
export default defineConfig({
    dialect: 'mysql',
    schema:
        './src/database/schema/mysql.schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: databaseUrl,
    },
    verbose: true,
    strict: true,
});
// nestforge:feature:database:mysql:end

// nestforge:feature:database:sqlite
export default defineConfig({
    dialect: 'sqlite',
    schema:
        './src/database/schema/sqlite.schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: databaseUrl.replace(/^file:/, ''),
    },
    verbose: true,
    strict: true,
});
// nestforge:feature:database:sqlite:end
