// nestforge:feature-file:auth:token
import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import {
    and,
    eq,
    isNull,
} from 'drizzle-orm';
import {
    createHash,
    randomUUID,
} from 'node:crypto';
import { InjectDatabase } from '../database/database.decorators';
import type { DrizzleDatabase } from '../database/database.types';
import {
    refreshTokens,
    users,
} from '../database/schema';

@Injectable()
export class TokenService {
    constructor(
        @InjectDatabase()
        private readonly database: DrizzleDatabase,
        private readonly jwtService: JwtService,
    ) { }

    async issueTokens(
        userId: string,
        email: string,
        role: string,
    ) {
        const payload = {
            sub: userId,
            email,
            role,
        };

        const refreshPayload = {
            ...payload,
            jti: randomUUID(),
        };

        const accessTokenExpiresIn = (
            process.env.JWT_ACCESS_EXPIRES_IN ??
            '15m'
        ) as JwtSignOptions['expiresIn'];

        const refreshTokenExpiresIn = (
            process.env.JWT_REFRESH_EXPIRES_IN ??
            '7d'
        ) as JwtSignOptions['expiresIn'];

        const accessToken = this.jwtService.sign(
            payload,
            {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: accessTokenExpiresIn,
            },
        );

        const refreshToken = this.jwtService.sign(
            refreshPayload,
            {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: refreshTokenExpiresIn,
            },
        );

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.database
            .insert(refreshTokens)
            .values({
                id: randomUUID(),
                tokenHash:
                    this.hashToken(refreshToken),
                userId,
                expiresAt,
                revokedAt: null,
            });

        return {
            accessToken,
            refreshToken,
        };
    }

    async refresh(refreshToken: string) {
        const tokenHash =
            this.hashToken(refreshToken);

        const [stored] = await this.database
            .select({
                id: refreshTokens.id,
                userId: refreshTokens.userId,
                expiresAt: refreshTokens.expiresAt,
                revokedAt: refreshTokens.revokedAt,
                userEmail: users.email,
                userRole: users.role,
            })
            .from(refreshTokens)
            .innerJoin(
                users,
                eq(refreshTokens.userId, users.id),
            )
            .where(
                eq(refreshTokens.tokenHash, tokenHash),
            )
            .limit(1);

        if (
            !stored ||
            stored.revokedAt ||
            stored.expiresAt < new Date()
        ) {
            throw new UnauthorizedException(
                'Invalid or expired refresh token',
            );
        }

        await this.database
            .update(refreshTokens)
            .set({
                revokedAt: new Date(),
            })
            .where(
                and(
                    eq(refreshTokens.id, stored.id),
                    isNull(refreshTokens.revokedAt),
                ),
            );

        return this.issueTokens(
            stored.userId,
            stored.userEmail,
            stored.userRole,
        );
    }

    async logout(refreshToken: string) {
        const tokenHash =
            this.hashToken(refreshToken);

        await this.database
            .update(refreshTokens)
            .set({
                revokedAt: new Date(),
            })
            .where(
                and(
                    eq(
                        refreshTokens.tokenHash,
                        tokenHash,
                    ),
                    isNull(refreshTokens.revokedAt),
                ),
            );

        return {
            message: 'Logout completed successfully',
        };
    }

    private hashToken(token: string): string {
        return createHash('sha256')
            .update(token)
            .digest('hex');
    }
}
