// nestforge:feature-file:auth:password
import {
    randomUUID,
} from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { Role } from '../common/constants/role.enum';
import {
    users,
} from './schema';
import * as schema from './schema';

// nestforge:feature:database:postgres
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
// nestforge:feature:database:postgres:end

// nestforge:feature:database:mysql
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
// nestforge:feature:database:mysql:end

// nestforge:feature:database:sqlite
import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
// nestforge:feature:database:sqlite:end

interface SeedUser {
    name: string;
    email: string;
    password: string;
    role: Role;
}

const SEED_USERS: SeedUser[] = [
    {
        name: 'Admin',
        email: 'admin@nestforge.dev',
        password: 'admin123',
        role: Role.ADMIN,
    },
    {
        name: 'Manager',
        email: 'manager@nestforge.dev',
        password: 'manager123',
        role: Role.MANAGER,
    },
    {
        name: 'Usuário',
        email: 'user@nestforge.dev',
        password: 'user1234',
        role: Role.USER,
    },
];

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        'DATABASE_URL não foi definida',
    );
}

// nestforge:feature:database:postgres
const client = new Pool({
    connectionString: databaseUrl,
});

const database = drizzle(client, {
    schema,
});
// nestforge:feature:database:postgres:end

// nestforge:feature:database:mysql
const client = createPool(databaseUrl);

const database = drizzle(client, {
    schema,
    mode: 'default',
});
// nestforge:feature:database:mysql:end

// nestforge:feature:database:sqlite
const databasePath = databaseUrl.replace(
    /^file:/,
    '',
);

const client = new BetterSqlite3(
    databasePath,
);

const database = drizzle(client, {
    schema,
});
// nestforge:feature:database:sqlite:end

async function seed(): Promise<void> {
    try {
        for (const seedUser of SEED_USERS) {
            const [existingUser] = await database
                .select({
                    id: users.id,
                })
                .from(users)
                .where(eq(users.email, seedUser.email))
                .limit(1);

            if (!existingUser) {
                const passwordHash =
                    await bcrypt.hash(
                        seedUser.password,
                        10,
                    );

                await database.insert(users).values({
                    id: randomUUID(),
                    name: seedUser.name,
                    email: seedUser.email,
                    passwordHash,
                    role: seedUser.role,
                    emailVerifiedAt: new Date(),
                });
            }

            console.log(
                `Seed: ${seedUser.email} / ${seedUser.password} (${seedUser.role})`,
            );
        }
    } finally {
        // nestforge:feature:database:postgres
        await client.end();
        // nestforge:feature:database:postgres:end

        // nestforge:feature:database:mysql
        await client.end();
        // nestforge:feature:database:mysql:end

        // nestforge:feature:database:sqlite
        client.close();
        // nestforge:feature:database:sqlite:end
    }
}

seed().catch((error: unknown) => {
    console.error(
        'Erro ao executar o seed:',
        error,
    );

    process.exitCode = 1;
});