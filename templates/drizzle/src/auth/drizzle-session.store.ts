// nestforge:feature-file:auth:session
import { Injectable } from '@nestjs/common';
import {
    and,
    count,
    eq,
    gt,
    isNull,
} from 'drizzle-orm';
import {
    Store,
    type SessionData,
} from 'express-session';
import { InjectDatabase } from '../database/database.decorators';
import type { DrizzleDatabase } from '../database/database.types';
import { sessions } from '../database/schema';

type StoreCallback = (error?: unknown) => void;

type GetCallback = (
    error: unknown,
    session?: SessionData | null,
) => void;

type AllCallback = (
    error: unknown,
    sessions?:
        | SessionData[]
        | Record<string, SessionData>
        | null,
) => void;

type LengthCallback = (
    error: unknown,
    length?: number,
) => void;

@Injectable()
export class DrizzleSessionStore extends Store {
    constructor(
        @InjectDatabase()
        private readonly database: DrizzleDatabase,
    ) {
        super();
    }

    async get(
        sessionId: string,
        callback: GetCallback,
    ): Promise<void> {
        try {
            const [storedSession] =
                await this.database
                    .select()
                    .from(sessions)
                    .where(
                        and(
                            eq(sessions.id, sessionId),
                            gt(sessions.expiredAt, Date.now()),
                            isNull(sessions.destroyedAt),
                        ),
                    )
                    .limit(1);

            if (!storedSession) {
                callback(null, null);
                return;
            }

            const sessionData = JSON.parse(
                storedSession.json,
            ) as SessionData;

            callback(null, sessionData);
        } catch (error) {
            callback(error);
        }
    }

    async set(
        sessionId: string,
        sessionData: SessionData,
        callback?: StoreCallback,
    ): Promise<void> {
        try {
            const values = {
                id: sessionId,
                expiredAt:
                    this.resolveExpiration(sessionData),
                json: JSON.stringify(sessionData),
                destroyedAt: null,
            };

            // nestforge:feature:database:postgres
            await this.database
                .insert(sessions)
                .values(values)
                .onConflictDoUpdate({
                    target: sessions.id,
                    set: {
                        expiredAt: values.expiredAt,
                        json: values.json,
                        destroyedAt: null,
                    },
                });
            // nestforge:feature:database:postgres:end

            // nestforge:feature:database:mysql
            await this.database
                .insert(sessions)
                .values(values)
                .onDuplicateKeyUpdate({
                    set: {
                        expiredAt: values.expiredAt,
                        json: values.json,
                        destroyedAt: null,
                    },
                });
            // nestforge:feature:database:mysql:end

            // nestforge:feature:database:sqlite
            await this.database
                .insert(sessions)
                .values(values)
                .onConflictDoUpdate({
                    target: sessions.id,
                    set: {
                        expiredAt: values.expiredAt,
                        json: values.json,
                        destroyedAt: null,
                    },
                });
            // nestforge:feature:database:sqlite:end

            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    async destroy(
        sessionId: string,
        callback?: StoreCallback,
    ): Promise<void> {
        try {
            await this.database
                .delete(sessions)
                .where(eq(sessions.id, sessionId));

            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    async touch(
        sessionId: string,
        sessionData: SessionData,
        callback?: StoreCallback,
    ): Promise<void> {
        try {
            await this.database
                .update(sessions)
                .set({
                    expiredAt:
                        this.resolveExpiration(sessionData),
                    json: JSON.stringify(sessionData),
                })
                .where(eq(sessions.id, sessionId));

            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    async all(
        callback: AllCallback,
    ): Promise<void> {
        try {
            const storedSessions =
                await this.database
                    .select({
                        json: sessions.json,
                    })
                    .from(sessions)
                    .where(
                        and(
                            gt(sessions.expiredAt, Date.now()),
                            isNull(sessions.destroyedAt),
                        ),
                    );

            const sessionData = storedSessions.map(
                (storedSession) =>
                    JSON.parse(
                        storedSession.json,
                    ) as SessionData,
            );

            callback(null, sessionData);
        } catch (error) {
            callback(error);
        }
    }

    async length(
        callback: LengthCallback,
    ): Promise<void> {
        try {
            const [result] = await this.database
                .select({
                    value: count(),
                })
                .from(sessions)
                .where(
                    and(
                        gt(sessions.expiredAt, Date.now()),
                        isNull(sessions.destroyedAt),
                    ),
                );

            callback(null, result?.value ?? 0);
        } catch (error) {
            callback(error);
        }
    }

    async clear(
        callback?: StoreCallback,
    ): Promise<void> {
        try {
            await this.database.delete(sessions);
            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    private resolveExpiration(
        sessionData: SessionData,
    ): number {
        const expires = sessionData.cookie.expires;

        if (expires) {
            return new Date(expires).getTime();
        }

        const maxAge = sessionData.cookie.maxAge;

        if (
            typeof maxAge === 'number' &&
            maxAge > 0
        ) {
            return Date.now() + maxAge;
        }

        return (
            Date.now() +
            7 * 24 * 60 * 60 * 1000
        );
    }
}