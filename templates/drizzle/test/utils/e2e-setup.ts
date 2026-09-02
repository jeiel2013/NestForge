import {
    ClassSerializerInterceptor,
    INestApplication,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

// nestforge:feature:validation
import { ZodValidationPipe } from 'nestjs-zod';
// nestforge:feature:validation:end

import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

// nestforge:feature:auth:session
import session from 'express-session';
import { DrizzleSessionStore } from '../../src/auth/drizzle-session.store';
// nestforge:feature:auth:session:end

export async function createTestApp(): Promise<INestApplication> {
    const moduleRef =
        await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

    const app =
        moduleRef.createNestApplication<NestExpressApplication>();

    // nestforge:feature:auth:session
    const sessionStore = app.get(
        DrizzleSessionStore,
    );

    const sessionMaxAge = Number(
        process.env.SESSION_MAX_AGE ??
        7 * 24 * 60 * 60 * 1000,
    );

    app.use(
        session({
            name: 'nestforge.sid',
            secret:
                process.env.SESSION_SECRET as string,
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            cookie: {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: sessionMaxAge,
            },
        }),
    );
    // nestforge:feature:auth:session:end

    // nestforge:feature:validation
    app.useGlobalPipes(
        new ZodValidationPipe(),
    );
    // nestforge:feature:validation:end

    app.useGlobalFilters(
        new HttpExceptionFilter(),
    );

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(
            app.get(Reflector),
        ),
    );

    await app.init();

    return app;
}