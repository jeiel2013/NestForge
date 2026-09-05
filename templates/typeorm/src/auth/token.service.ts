// nestforge:feature-file:auth:token
import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { IsNull, Repository } from 'typeorm';
import { createHash } from 'crypto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(RefreshTokenEntity)
        private readonly refreshTokensRepository: Repository<RefreshTokenEntity>,
        private readonly jwtService: JwtService,
    ) { }

    async issueTokens(
        userId: string,
        email: string,
        role: string,
    ) {
        const payload = { sub: userId, email, role };

        const accessTokenExpiresIn = (
            process.env.JWT_ACCESS_EXPIRES_IN ?? '15m'
        ) as JwtSignOptions['expiresIn'];

        const refreshTokenExpiresIn = (
            process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'
        ) as JwtSignOptions['expiresIn'];

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn:
                accessTokenExpiresIn,
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn:
                refreshTokenExpiresIn,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const storedToken = this.refreshTokensRepository.create({
            tokenHash: this.hashToken(refreshToken),
            userId,
            expiresAt,
            revokedAt: null,
        });

        await this.refreshTokensRepository.save(storedToken);

        return { accessToken, refreshToken };
    }

    async refresh(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);

        const stored = await this.refreshTokensRepository.findOne({
            where: { tokenHash },
            relations: {
                user: true,
            },
        });

        if (
            !stored ||
            stored.revokedAt ||
            stored.expiresAt < new Date()
        ) {
            throw new UnauthorizedException(
                'Invalid or expired refresh token',
            );
        }

        stored.revokedAt = new Date();

        await this.refreshTokensRepository.save(stored);

        return this.issueTokens(
            stored.user.id,
            stored.user.email,
            stored.user.role,
        );
    }

    async logout(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);

        await this.refreshTokensRepository.update(
            {
                tokenHash,
                revokedAt: IsNull(),
            },
            {
                revokedAt: new Date(),
            },
        );

        return { message: 'Logout completed successfully' };
    }

    private hashToken(token: string): string {
        return createHash('sha256')
            .update(token)
            .digest('hex');
    }
}
