// nestforge:feature-file:auth:password
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
// nestforge:feature:redis
import { MailService } from '../mail/mail.service';
// nestforge:feature:redis:end

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: any;
  // nestforge:feature:redis
  let mailService: MailService;
  // nestforge:feature:redis:end

  beforeEach(() => {
    prisma = {
      user: { findUnique: vi.fn(), create: vi.fn() },
      refreshToken: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    };

    // nestforge:feature:redis
    mailService = {
      queueVerificationEmail: vi.fn(),
      queuePasswordResetEmail: vi.fn(),
    } as unknown as MailService;
    // nestforge:feature:redis:end

    authService = new AuthService(
      prisma as PrismaService,
      // nestforge:feature:redis
      mailService,
      // nestforge:feature:redis:end
    );
  });

  it('deve lançar ConflictException se o e-mail já existir', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'jeiel@example.com' });

    await expect(
      authService.register({ name: 'Jeiel', email: 'jeiel@example.com', password: 'senhaForte123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deve lançar UnauthorizedException com credenciais inválidas', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'naoexiste@example.com', password: 'qualquer123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
