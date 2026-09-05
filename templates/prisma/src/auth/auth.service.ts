import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
// nestforge:feature:redis,auth:password
import { MailService } from '../mail/mail.service';
// nestforge:feature:redis,auth:password:end
// nestforge:feature:auth:password
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// nestforge:feature:auth:password:end
import { OAuthProfile } from './strategies/google.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    // nestforge:feature:redis,auth:password
    private readonly mailService: MailService,
    // nestforge:feature:redis,auth:password:end
  ) { }

  // nestforge:feature:auth:password
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash },
    });

    // nestforge:feature:redis
    await this.sendEmailVerification(user.id, user.email, user.name);
    // nestforge:feature:redis:end

    return this.toAuthenticatedUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.toAuthenticatedUser(user);
  }
  // nestforge:feature:auth:password:end

  async validateOAuthLogin(profile: OAuthProfile) {
    const linkedAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: profile.provider,
          providerUserId: profile.providerUserId,
        },
      },
      include: { user: true },
    });

    if (linkedAccount) {
      return this.toAuthenticatedUser(linkedAccount.user);
    }

    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          emailVerifiedAt: new Date(),
        },
      });
    }

    await this.prisma.oAuthAccount.create({
      data: {
        provider: profile.provider,
        providerUserId: profile.providerUserId,
        userId: user.id,
      },
    });

    return this.toAuthenticatedUser(user);
  }

  // nestforge:feature:redis,auth:password
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return a generic response to avoid revealing whether the email exists.
    const genericResponse = {
      message: 'If the email exists, password reset instructions will be sent',
    };

    if (!user) {
      return genericResponse;
    }

    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash: this.hashToken(rawToken),
        userId: user.id,
        expiresAt,
      },
    });

    await this.mailService.queuePasswordResetEmail(user.email, user.name, rawToken);

    return genericResponse;
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = this.hashToken(rawToken);

    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      // Revoke every active session after a password change for security.
      this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);

    const stored = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  private async sendEmailVerification(userId: string, email: string, name: string) {
    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.prisma.emailVerificationToken.create({
      data: {
        tokenHash: this.hashToken(rawToken),
        userId,
        expiresAt,
      },
    });

    await this.mailService.queueVerificationEmail(email, name, rawToken);
  }
  // nestforge:feature:redis,auth:password:end

  private toAuthenticatedUser(user: {
    id: string;
    email: string;
    role: string;
  }) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
