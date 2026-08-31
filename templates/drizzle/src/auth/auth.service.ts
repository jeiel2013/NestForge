import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  and,
  eq,
  isNull,
} from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import {
  createHash,
  randomBytes,
  randomUUID,
} from 'node:crypto';
import { Role } from '../common/constants/role.enum';
import { InjectDatabase } from '../database/database.decorators';
import type { DrizzleDatabase } from '../database/database.types';
import {
  oauthAccounts,
  users,
} from '../database/schema';

// nestforge:feature:auth:token
import { refreshTokens } from '../database/schema';
// nestforge:feature:auth:token:end

// nestforge:feature:redis,auth:password
import { MailService } from '../mail/mail.service';
import {
  emailVerificationTokens,
  passwordResetTokens,
} from '../database/schema';
// nestforge:feature:redis,auth:password:end

// nestforge:feature:auth:password
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// nestforge:feature:auth:password:end

import { OAuthProfile } from './strategies/google.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectDatabase()
    private readonly database: DrizzleDatabase,

    // nestforge:feature:redis,auth:password
    private readonly mailService: MailService,
    // nestforge:feature:redis,auth:password:end
  ) { }

  // nestforge:feature:auth:password
  async register(dto: RegisterDto) {
    const existing = await this.findUserByEmail(
      dto.email,
    );

    if (existing) {
      throw new ConflictException(
        'E-mail já cadastrado',
      );
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(
      dto.password,
      10,
    );

    await this.database.insert(users).values({
      id,
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: Role.USER,
    });

    const user = {
      id,
      name: dto.name,
      email: dto.email,
      role: Role.USER,
    };

    // nestforge:feature:redis
    await this.sendEmailVerification(
      user.id,
      user.email,
      user.name,
    );
    // nestforge:feature:redis:end

    return this.toAuthenticatedUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.findUserByEmail(
      dto.email,
    );

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

  async validateOAuthLogin(
    profile: OAuthProfile,
  ) {
    const [linkedAccount] = await this.database
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
      })
      .from(oauthAccounts)
      .innerJoin(
        users,
        eq(oauthAccounts.userId, users.id),
      )
      .where(
        and(
          eq(
            oauthAccounts.provider,
            profile.provider,
          ),
          eq(
            oauthAccounts.providerUserId,
            profile.providerUserId,
          ),
        ),
      )
      .limit(1);

    if (linkedAccount) {
      return this.toAuthenticatedUser(
        linkedAccount,
      );
    }

    let user = await this.findUserByEmail(
      profile.email,
    );

    if (!user) {
      const userId = randomUUID();

      await this.database.insert(users).values({
        id: userId,
        name: profile.name,
        email: profile.email,
        passwordHash: null,
        role: Role.USER,
        emailVerifiedAt: new Date(),
      });

      user = {
        id: userId,
        name: profile.name,
        email: profile.email,
        passwordHash: null,
        role: Role.USER,
        avatarUrl: null,
        emailVerifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    await this.database
      .insert(oauthAccounts)
      .values({
        id: randomUUID(),
        provider: profile.provider,
        providerUserId:
          profile.providerUserId,
        userId: user.id,
      });

    return this.toAuthenticatedUser(user);
  }

  // nestforge:feature:redis,auth:password
  async forgotPassword(email: string) {
    const user = await this.findUserByEmail(
      email,
    );

    const genericResponse = {
      message:
        'Se o e-mail existir, enviaremos instruções de redefinição de senha',
    };

    if (!user) {
      return genericResponse;
    }

    const rawToken = randomBytes(32).toString(
      'hex',
    );

    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + 1,
    );

    await this.database
      .insert(passwordResetTokens)
      .values({
        id: randomUUID(),
        tokenHash: this.hashToken(rawToken),
        userId: user.id,
        expiresAt,
        usedAt: null,
      });

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

    const [stored] = await this.database
      .select()
      .from(passwordResetTokens)
      .where(
        eq(
          passwordResetTokens.tokenHash,
          tokenHash,
        ),
      )
      .limit(1);

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

    await this.database.transaction(
      async (transaction) => {
        await transaction
          .update(users)
          .set({
            passwordHash,
            updatedAt: new Date(),
          })
          .where(eq(users.id, stored.userId));

        await transaction
          .update(passwordResetTokens)
          .set({
            usedAt: new Date(),
          })
          .where(
            and(
              eq(
                passwordResetTokens.id,
                stored.id,
              ),
              isNull(
                passwordResetTokens.usedAt,
              ),
            ),
          );

        // nestforge:feature:auth:token
        await transaction
          .update(refreshTokens)
          .set({
            revokedAt: new Date(),
          })
          .where(
            and(
              eq(
                refreshTokens.userId,
                stored.userId,
              ),
              isNull(
                refreshTokens.revokedAt,
              ),
            ),
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

    const [stored] = await this.database
      .select()
      .from(emailVerificationTokens)
      .where(
        eq(
          emailVerificationTokens.tokenHash,
          tokenHash,
        ),
      )
      .limit(1);

    if (
      !stored ||
      stored.usedAt ||
      stored.expiresAt < new Date()
    ) {
      throw new UnauthorizedException(
        'Token de verificação inválido ou expirado',
      );
    }

    await this.database.transaction(
      async (transaction) => {
        await transaction
          .update(users)
          .set({
            emailVerifiedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, stored.userId));

        await transaction
          .update(emailVerificationTokens)
          .set({
            usedAt: new Date(),
          })
          .where(
            and(
              eq(
                emailVerificationTokens.id,
                stored.id,
              ),
              isNull(
                emailVerificationTokens.usedAt,
              ),
            ),
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
    const rawToken = randomBytes(32).toString(
      'hex',
    );

    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + 24,
    );

    await this.database
      .insert(emailVerificationTokens)
      .values({
        id: randomUUID(),
        tokenHash: this.hashToken(rawToken),
        userId,
        expiresAt,
        usedAt: null,
      });

    await this.mailService.queueVerificationEmail(
      email,
      name,
      rawToken,
    );
  }
  // nestforge:feature:redis,auth:password:end

  private async findUserByEmail(
    email: string,
  ) {
    const [user] = await this.database
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }

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