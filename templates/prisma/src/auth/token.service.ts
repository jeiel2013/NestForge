// nestforge:feature-file:auth:token
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TokenService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async issueTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessTokenExpiresIn = (
            process.env.JWT_ACCESS_EXPIRES_IN ?? '15m'
        ) as JwtSignOptions['expiresIn'];

        const refreshTokenExpiresIn = (
            process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'
        ) as JwtSignOptions['expiresIn'];

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: accessTokenExpiresIn,
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: refreshTokenExpiresIn,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: {
                tokenHash: this.hashToken(refreshToken),
                userId,
                expiresAt,
            },
        });

        return { accessToken, refreshToken };
    }

    async refresh(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);

        const stored = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });

        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });

        return this.issueTokens(
            stored.user.id,
            stored.user.email,
            stored.user.role,
        );
    }

    async logout(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);

        await this.prisma.refreshToken.updateMany({
            where: {
                tokenHash,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        return { message: 'Logout completed successfully' };
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
