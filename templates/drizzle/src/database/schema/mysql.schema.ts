// nestforge:feature-file:database:mysql
import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import {
    bigint,
    datetime,
    index,
    mysqlEnum,
    mysqlTable,
    text,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: varchar('id', { length: 36 })
        .$defaultFn(() => randomUUID())
        .primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 255 })
        .notNull()
        .unique(),
    passwordHash: varchar('password_hash', {
        length: 255,
    }),
    role: mysqlEnum('role', [
        'ADMIN',
        'MANAGER',
        'USER',
    ])
        .default('USER')
        .notNull(),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    emailVerifiedAt: datetime('email_verified_at', {
        mode: 'date',
    }),
    createdAt: datetime('created_at', {
        mode: 'date',
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: datetime('updated_at', {
        mode: 'date',
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .$onUpdate(() => new Date())
        .notNull(),
});

export const oauthAccounts = mysqlTable(
    'oauth_accounts',
    {
        id: varchar('id', { length: 36 })
            .$defaultFn(() => randomUUID())
            .primaryKey(),
        provider: varchar('provider', {
            length: 32,
        }).notNull(),
        providerUserId: varchar('provider_user_id', {
            length: 255,
        }).notNull(),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        createdAt: datetime('created_at', {
            mode: 'date',
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        uniqueIndex(
            'oauth_accounts_provider_provider_user_id_key',
        ).on(table.provider, table.providerUserId),
        index('oauth_accounts_user_id_idx').on(table.userId),
    ],
);

// nestforge:feature:auth:token
export const refreshTokens = mysqlTable(
    'refresh_tokens',
    {
        id: varchar('id', { length: 36 })
            .$defaultFn(() => randomUUID())
            .primaryKey(),
        tokenHash: varchar('token_hash', {
            length: 64,
        })
            .notNull()
            .unique(),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        expiresAt: datetime('expires_at', {
            mode: 'date',
        }).notNull(),
        revokedAt: datetime('revoked_at', {
            mode: 'date',
        }),
        createdAt: datetime('created_at', {
            mode: 'date',
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index('refresh_tokens_user_id_idx').on(table.userId),
    ],
);
// nestforge:feature:auth:token:end

// nestforge:feature:redis,auth:password
export const passwordResetTokens = mysqlTable(
    'password_reset_tokens',
    {
        id: varchar('id', { length: 36 })
            .$defaultFn(() => randomUUID())
            .primaryKey(),
        tokenHash: varchar('token_hash', {
            length: 64,
        })
            .notNull()
            .unique(),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        expiresAt: datetime('expires_at', {
            mode: 'date',
        }).notNull(),
        usedAt: datetime('used_at', {
            mode: 'date',
        }),
        createdAt: datetime('created_at', {
            mode: 'date',
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index('password_reset_tokens_user_id_idx').on(
            table.userId,
        ),
    ],
);

export const emailVerificationTokens = mysqlTable(
    'email_verification_tokens',
    {
        id: varchar('id', { length: 36 })
            .$defaultFn(() => randomUUID())
            .primaryKey(),
        tokenHash: varchar('token_hash', {
            length: 64,
        })
            .notNull()
            .unique(),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        expiresAt: datetime('expires_at', {
            mode: 'date',
        }).notNull(),
        usedAt: datetime('used_at', {
            mode: 'date',
        }),
        createdAt: datetime('created_at', {
            mode: 'date',
        })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        index('email_verification_tokens_user_id_idx').on(
            table.userId,
        ),
    ],
);
// nestforge:feature:redis,auth:password:end

// nestforge:feature:auth:session
export const sessions = mysqlTable(
    'sessions',
    {
        id: varchar('id', { length: 255 }).primaryKey(),
        expiredAt: bigint('expired_at', {
            mode: 'number',
        }).notNull(),
        json: text('json').notNull(),
        destroyedAt: datetime('destroyed_at', {
            mode: 'date',
        }),
    },
    (table) => [
        index('sessions_expired_at_idx').on(
            table.expiredAt,
        ),
    ],
);
// nestforge:feature:auth:session:end

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type OAuthAccount =
    typeof oauthAccounts.$inferSelect;
export type NewOAuthAccount =
    typeof oauthAccounts.$inferInsert;