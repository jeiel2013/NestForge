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
import { TypeormStore } from 'connect-typeorm';
import { DataSource } from 'typeorm';
import { SessionEntity } from '../../src/auth/entities/session.entity';
// nestforge:feature:auth:session:end

export async function createTestApp(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app =
        moduleRef.createNestApplication<NestExpressApplication>();

    // nestforge:feature:auth:session
    const dataSource = app.get(DataSource);
    const sessionsRepository =
        dataSource.getRepository(SessionEntity);

    const sessionMaxAge = Number(
        process.env.SESSION_MAX_AGE ??
        7 * 24 * 60 * 60 * 1000,
    );

    app.use(
        session({
            name: 'nestforge.sid',
            secret: process.env.SESSION_SECRET as string,
            resave: false,
            saveUninitialized: false,
            store: new TypeormStore({
                cleanupLimit: 2,
                limitSubquery: false,
                ttl: Math.floor(sessionMaxAge / 1000),
            }).connect(sessionsRepository),
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
    app.useGlobalPipes(new ZodValidationPipe());
    // nestforge:feature:validation:end

    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(
            app.get(Reflector),
        ),
    );

    await app.init();

    return app;
}