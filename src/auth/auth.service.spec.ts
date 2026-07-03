import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: { findUnique: vi.fn(), create: vi.fn() },
      refreshToken: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    };

    authService = new AuthService(prisma as PrismaService, new JwtService());
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
