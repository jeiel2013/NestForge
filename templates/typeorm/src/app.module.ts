import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
// nestforge:feature:redis
import { BullModule } from '@nestjs/bullmq';
// nestforge:feature:redis:end
import { LoggerModule } from 'nestjs-pino';
// nestforge:feature:auth:enabled
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// nestforge:feature:auth:enabled:end
import { DatabaseModule } from './database/database.module';
// nestforge:feature:redis
import { MailModule } from './mail/mail.module';
// nestforge:feature:redis:end
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
// nestforge:feature:auth:session
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
// nestforge:feature:auth:session:end
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL ?? 60) * 1000,
        limit: Number(process.env.THROTTLE_LIMIT ?? 100),
      },
    ]),
    // nestforge:feature:redis
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    // nestforge:feature:redis:end
    DatabaseModule,
    // nestforge:feature:auth:enabled
    AuthModule,
    UsersModule,
    // nestforge:feature:auth:enabled:end
    // nestforge:feature:redis
    MailModule,
    // nestforge:feature:redis:end
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // nestforge:feature:auth:session
    if (process.env.ENABLE_CSRF === 'true') {
      consumer.apply(CsrfMiddleware).forRoutes('*');
    }
    // nestforge:feature:auth:session:end
  }
}