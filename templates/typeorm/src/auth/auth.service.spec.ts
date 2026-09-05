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
import { DataSource, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entities/user.entity';
import { OAuthAccountEntity } from './entities/oauth-account.entity';

// nestforge:feature:redis
import { MailService } from '../mail/mail.service';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';
import { EmailVerificationTokenEntity } from './entities/email-verification-token.entity';
// nestforge:feature:redis:end

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: any;
  let oauthAccountsRepository: any;
  let dataSource: DataSource;

  // nestforge:feature:redis
  let passwordResetTokensRepository: any;
  let emailVerificationTokensRepository: any;
  let mailService: MailService;
  // nestforge:feature:redis:end

  beforeEach(() => {
    usersRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    oauthAccountsRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    dataSource = {
      transaction: vi.fn(),
    } as unknown as DataSource;

    // nestforge:feature:redis
    passwordResetTokensRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    emailVerificationTokensRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    mailService = {
      queueVerificationEmail: vi.fn(),
      queuePasswordResetEmail: vi.fn(),
    } as unknown as MailService;
    // nestforge:feature:redis:end

    authService = new AuthService(
      usersRepository as unknown as Repository<UserEntity>,
      oauthAccountsRepository as unknown as Repository<OAuthAccountEntity>,
      dataSource,
      // nestforge:feature:redis
      passwordResetTokensRepository as unknown as Repository<PasswordResetTokenEntity>,
      emailVerificationTokensRepository as unknown as Repository<EmailVerificationTokenEntity>,
      mailService,
      // nestforge:feature:redis:end
    );
  });

  it('throws ConflictException when the email already exists', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'jeiel@example.com',
    });

    await expect(
      authService.register({
        name: 'Jeiel',
        email: 'jeiel@example.com',
        password: 'strongPassword123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws UnauthorizedException for invalid credentials', async () => {
    usersRepository.findOne.mockResolvedValue(null);

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
