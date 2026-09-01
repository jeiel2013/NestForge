import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

// nestforge:feature:auth:token
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
// nestforge:feature:auth:token:end

// nestforge:feature:redis
import { MailModule } from '../mail/mail.module';
// nestforge:feature:redis:end

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';

// nestforge:feature:rbac
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
// nestforge:feature:rbac:end

// nestforge:feature:auth:session
import { SessionAuthGuard } from './guards/session-auth.guard';
import { SessionService } from './session.service';
import { DrizzleSessionStore } from './drizzle-session.store';
// nestforge:feature:auth:session:end

@Module({
  imports: [
    PassportModule,
    // nestforge:feature:auth:token
    JwtModule.register({}),
    // nestforge:feature:auth:token:end
    // nestforge:feature:redis
    MailModule,
    // nestforge:feature:redis:end
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // nestforge:feature:auth:token
    TokenService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // nestforge:feature:auth:token:end
    // nestforge:feature:auth:session
    DrizzleSessionStore,
    SessionService,
    {
      provide: APP_GUARD,
      useClass: SessionAuthGuard,
    },
    // nestforge:feature:auth:session:end
    GoogleStrategy,
    GithubStrategy,
    // nestforge:feature:rbac
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    // nestforge:feature:rbac:end
  ],
  exports: [
    AuthService,
    // nestforge:feature:auth:session
    DrizzleSessionStore,
    // nestforge:feature:auth:session:end
  ],
})
export class AuthModule { }