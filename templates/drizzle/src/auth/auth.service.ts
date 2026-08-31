import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  IsNull,
  Repository,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { UserEntity } from '../users/entities/user.entity';
import { OAuthAccountEntity } from './entities/oauth-account.entity';

// nestforge:feature:auth:token
import { RefreshTokenEntity } from './entities/refresh-token.entity';
// nestforge:feature:auth:token:end

// nestforge:feature:redis,auth:password
import { MailService } from '../mail/mail.service';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';
import { EmailVerificationTokenEntity } from './entities/email-verification-token.entity';
// nestforge:feature:redis,auth:password:end

// nestforge:feature:auth:password
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// nestforge:feature:auth:password:end

import { OAuthProfile } from './strategies/google.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(OAuthAccountEntity)
    private readonly oauthAccountsRepository: Repository<OAuthAccountEntity>,

    private readonly dataSource: DataSource,

    // nestforge:feature:redis,auth:password
    @InjectRepository(PasswordResetTokenEntity)
    private readonly passwordResetTokensRepository: Repository<PasswordResetTokenEntity>,

    @InjectRepository(EmailVerificationTokenEntity)
    private readonly emailVerificationTokensRepository: Repository<EmailVerificationTokenEntity>,

    private readonly mailService: MailService,
    // nestforge:feature:redis,auth:password:end
  ) { }

  // nestforge:feature:auth:password
  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    const savedUser = await this.usersRepository.save(user);

    // nestforge:feature:redis
    await this.sendEmailVerification(
      savedUser.id,
      savedUser.email,
      savedUser.name,
    );
    // nestforge:feature:redis:end

    return this.toAuthenticatedUser(savedUser);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(
        'Credenciais inválidas',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Credenciais inválidas',
      );
    }

    return this.toAuthenticatedUser(user);
  }
  // nestforge:feature:auth:password:end

  async validateOAuthLogin(profile: OAuthProfile) {
    const linkedAccount =
      await this.oauthAccountsRepository.findOne({
        where: {
          provider: profile.provider,
          providerUserId: profile.providerUserId,
        },
        relations: {
          user: true,
        },
      });

    if (linkedAccount) {
      return this.toAuthenticatedUser(
        linkedAccount.user,
      );
    }

    let user = await this.usersRepository.findOne({
      where: { email: profile.email },
    });

    if (!user) {
      const newUser = this.usersRepository.create({
        name: profile.name,
        email: profile.email,
        emailVerifiedAt: new Date(),
      });

      user = await this.usersRepository.save(newUser);
    }

    const oauthAccount =
      this.oauthAccountsRepository.create({
        provider: profile.provider,
        providerUserId: profile.providerUserId,
        userId: user.id,
      });

    await this.oauthAccountsRepository.save(
      oauthAccount,
    );

    return this.toAuthenticatedUser(user);
  }

  // nestforge:feature:redis,auth:password
  async forgotPassword(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    const genericResponse = {
      message:
        'Se o e-mail existir, enviaremos instruções de redefinição de senha',
    };

    if (!user) {
      return genericResponse;
    }

    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();

    expiresAt.setHours(expiresAt.getHours() + 1);

    const resetToken =
      this.passwordResetTokensRepository.create({
        tokenHash: this.hashToken(rawToken),
        userId: user.id,
        expiresAt,
        usedAt: null,
      });

    await this.passwordResetTokensRepository.save(
      resetToken,
    );

    await this.mailService.queuePasswordResetEmail(
      user.email,
      user.name,
      rawToken,
    );

    return genericResponse;
  }

  async resetPassword(
    rawToken: string,
    newPassword: string,
  ) {
    const tokenHash = this.hashToken(rawToken);

    const stored =
      await this.passwordResetTokensRepository.findOne({
        where: { tokenHash },
      });

    if (
      !stored ||
      stored.usedAt ||
      stored.expiresAt < new Date()
    ) {
      throw new UnauthorizedException(
        'Token de redefinição inválido ou expirado',
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      10,
    );

    await this.dataSource.transaction(
      async (manager) => {
        await manager.update(
          UserEntity,
          { id: stored.userId },
          { passwordHash },
        );

        await manager.update(
          PasswordResetTokenEntity,
          { id: stored.id },
          { usedAt: new Date() },
        );

        // nestforge:feature:auth:token
        await manager.update(
          RefreshTokenEntity,
          {
            userId: stored.userId,
            revokedAt: IsNull(),
          },
          {
            revokedAt: new Date(),
          },
        );
        // nestforge:feature:auth:token:end
      },
    );

    return {
      message: 'Senha redefinida com sucesso',
    };
  }

  async verifyEmail(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);

    const stored =
      await this.emailVerificationTokensRepository.findOne({
        where: { tokenHash },
      });

    if (
      !stored ||
      stored.usedAt ||
      stored.expiresAt < new Date()
    ) {
      throw new UnauthorizedException(
        'Token de verificação inválido ou expirado',
      );
    }

    await this.dataSource.transaction(
      async (manager) => {
        await manager.update(
          UserEntity,
          { id: stored.userId },
          { emailVerifiedAt: new Date() },
        );

        await manager.update(
          EmailVerificationTokenEntity,
          { id: stored.id },
          { usedAt: new Date() },
        );
      },
    );

    return {
      message: 'E-mail verificado com sucesso',
    };
  }

  private async sendEmailVerification(
    userId: string,
    email: string,
    name: string,
  ) {
    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();

    expiresAt.setHours(expiresAt.getHours() + 24);

    const verificationToken =
      this.emailVerificationTokensRepository.create({
        tokenHash: this.hashToken(rawToken),
        userId,
        expiresAt,
        usedAt: null,
      });

    await this.emailVerificationTokensRepository.save(
      verificationToken,
    );

    await this.mailService.queueVerificationEmail(
      email,
      name,
      rawToken,
    );
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
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }
}