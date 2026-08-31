// nestforge:feature-file:database:sqlite
import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import {
    index,
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id')
        .$defaultFn(() => randomUUID())
        .primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    role: text('role', {
        enum: ['ADMIN', 'MANAGER', 'USER'],
    })
        .default('USER')
        .notNull(),
    avatarUrl: text('avatar_url'),
    emailVerifiedAt: integer('email_verified_at', {
        mode: 'timestamp_ms',
    }),
    createdAt: integer('created_at', {
        mode: 'timestamp_ms',
    })
        .default(sql`(unixepoch() * 1000)`)
        .notNull(),
    updatedAt: integer('updated_at', {
        mode: 'timestamp_ms',
    })
        .default(sql`(unixepoch() * 1000)`)
        .$onUpdate(() => new Date())
        .notNull(),
});

export const oauthAccounts = sqliteTable(
    'oauth_accounts',
    {
        id: text('id')
            .$defaultFn(() => randomUUID())
            .primaryKey(),
        provider: text('provider').notNull(),
        providerUserId: text(
            'provider_user_id',
        ).notNull(),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        createdAt: integer('created_at', {
            mode: 'timestamp_ms',
        })
            .default(sql`(unixepoch() * 1000)`)
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
export const refreshTokens = sqliteTable(
    'refresh_tokens',
    {
        id: text('id')
            .$defaultFn(() => randomUUID())
            .primaryKey(),
        tokenHash: text('token_hash').notNull().unique(),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        expiresAt: integer('expires_at', {
            mode: 'timestamp_ms',
        }).notNull(),
        revokedAt: integer('revoked_at', {
            mode: 'timestamp_ms',
        }),
        createdAt: integer('created_at', {
            mode: 'timestamp_ms',
        })
            .default(sql`(unixepoch() * 1000)`)
            .notNull(),
    },
    (table) => [
        index('refresh_tokens_user_id_idx').on(table.userId),
    ],
);
// nestforge:feature:auth:token:end

// nestforge:feature:redis,auth:password
export const passwordResetTokens = sqliteTable(
    'password_reset_tokens',
    {
        id: text('id')
            .$defaultFn(() => randomUUID())
            .primaryKey(),
        tokenHash: text('token_hash').notNull().unique(),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        expiresAt: integer('expires_at', {
            mode: 'timestamp_ms',
        }).notNull(),
        usedAt: integer('used_at', {
            mode: 'timestamp_ms',
        }),
        createdAt: integer('created_at', {
            mode: 'timestamp_ms',
        })
            .default(sql`(unixepoch() * 1000)`)
            .notNull(),
    },
    (table) => [
        index('password_reset_tokens_user_id_idx').on(
            table.userId,
        ),
    ],
);

export const emailVerificationTokens = sqliteTable(
    'email_verification_tokens',
    {
        id: text('id')
            .$defaultFn(() => randomUUID())
            .primaryKey(),
        tokenHash: text('token_hash').notNull().unique(),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        expiresAt: integer('expires_at', {
            mode: 'timestamp_ms',
        }).notNull(),
        usedAt: integer('used_at', {
            mode: 'timestamp_ms',
        }),
        createdAt: integer('created_at', {
            mode: 'timestamp_ms',
        })
            .default(sql`(unixepoch() * 1000)`)
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
export const sessions = sqliteTable(
    'sessions',
    {
        id: text('id').primaryKey(),
        expiredAt: integer('expired_at').notNull(),
        json: text('json').notNull(),
        destroyedAt: integer('destroyed_at', {
            mode: 'timestamp_ms',
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