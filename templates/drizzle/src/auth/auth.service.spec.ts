// nestforge:feature-file:auth:password
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import type { DrizzleDatabase } from '../database/database.types';
import { AuthService } from './auth.service';

// nestforge:feature:redis
import { MailService } from '../mail/mail.service';
// nestforge:feature:redis:end

function createSelectBuilder<T>(result: T[]) {
  const builder: any = {};

  builder.from = vi.fn(() => builder);
  builder.innerJoin = vi.fn(() => builder);
  builder.where = vi.fn(() => builder);
  builder.limit = vi.fn(() => builder);

  builder.then = (
    resolve: (value: T[]) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject);

  return builder;
}

describe('AuthService', () => {
  let authService: AuthService;
  let database: any;

  // nestforge:feature:redis
  let mailService: MailService;
  // nestforge:feature:redis:end

  beforeEach(() => {
    database = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      transaction: vi.fn(),
    };

    // nestforge:feature:redis
    mailService = {
      queueVerificationEmail: vi.fn(),
      queuePasswordResetEmail: vi.fn(),
    } as unknown as MailService;
    // nestforge:feature:redis:end

    authService = new AuthService(
      database as unknown as DrizzleDatabase,
      // nestforge:feature:redis
      mailService,
      // nestforge:feature:redis:end
    );
  });

  it('throws ConflictException when the email already exists', async () => {
    database.select.mockReturnValueOnce(
      createSelectBuilder([
        {
          id: 'user-1',
          name: 'Jeiel',
          email: 'jeiel@example.com',
          passwordHash: 'hash-secreto',
          role: 'USER',
          avatarUrl: null,
          emailVerifiedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    );

    await expect(
      authService.register({
        name: 'Jeiel',
        email: 'jeiel@example.com',
        password: 'strongPassword123',
      }),
    ).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(database.insert).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException for invalid credentials', async () => {
    database.select.mockReturnValueOnce(
      createSelectBuilder([]),
    );

    await expect(
      authService.login({
        email: 'naoexiste@example.com',
        password: 'qualquer123',
      }),
    ).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
