// nestforge:feature-file:database:postgres
import {
    bigint,
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', [
    'ADMIN',
    'MANAGER',
    'USER',
]);

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 255 })
        .notNull()
        .unique(),
    passwordHash: varchar('password_hash', {
        length: 255,
    }),
    role: roleEnum('role').default('USER').notNull(),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    emailVerifiedAt: timestamp('email_verified_at', {
        withTimezone: true,
        mode: 'date',
    }),
    createdAt: timestamp('created_at', {
        withTimezone: true,
        mode: 'date',
    })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', {
        withTimezone: true,
        mode: 'date',
    })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const oauthAccounts = pgTable(
    'oauth_accounts',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        provider: varchar('provider', {
            length: 32,
        }).notNull(),
        providerUserId: varchar('provider_user_id', {
            length: 255,
        }).notNull(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        createdAt: timestamp('created_at', {
            withTimezone: true,
            mode: 'date',
        })
            .defaultNow()
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
export const refreshTokens = pgTable(
    'refresh_tokens',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        tokenHash: varchar('token_hash', {
            length: 64,
        })
            .notNull()
            .unique(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        expiresAt: timestamp('expires_at', {
            withTimezone: true,
            mode: 'date',
        }).notNull(),
        revokedAt: timestamp('revoked_at', {
            withTimezone: true,
            mode: 'date',
        }),
        createdAt: timestamp('created_at', {
            withTimezone: true,
            mode: 'date',
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('refresh_tokens_user_id_idx').on(table.userId),
    ],
);
// nestforge:feature:auth:token:end

// nestforge:feature:redis,auth:password
export const passwordResetTokens = pgTable(
    'password_reset_tokens',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        tokenHash: varchar('token_hash', {
            length: 64,
        })
            .notNull()
            .unique(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        expiresAt: timestamp('expires_at', {
            withTimezone: true,
            mode: 'date',
        }).notNull(),
        usedAt: timestamp('used_at', {
            withTimezone: true,
            mode: 'date',
        }),
        createdAt: timestamp('created_at', {
            withTimezone: true,
            mode: 'date',
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index('password_reset_tokens_user_id_idx').on(
            table.userId,
        ),
    ],
);

export const emailVerificationTokens = pgTable(
    'email_verification_tokens',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        tokenHash: varchar('token_hash', {
            length: 64,
        })
            .notNull()
            .unique(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        expiresAt: timestamp('expires_at', {
            withTimezone: true,
            mode: 'date',
        }).notNull(),
        usedAt: timestamp('used_at', {
            withTimezone: true,
            mode: 'date',
        }),
        createdAt: timestamp('created_at', {
            withTimezone: true,
            mode: 'date',
        })
            .defaultNow()
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
export const sessions = pgTable(
    'sessions',
    {
        id: varchar('id', { length: 255 }).primaryKey(),
        expiredAt: bigint('expired_at', {
            mode: 'number',
        }).notNull(),
        json: text('json').notNull(),
        destroyedAt: timestamp('destroyed_at', {
            withTimezone: true,
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