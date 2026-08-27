import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
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
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaService } from '../../src/database/prisma.service';
// nestforge:feature:auth:session:end

export async function createTestApp(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication<NestExpressApplication>();

    // nestforge:feature:auth:session
    const prisma = app.get(PrismaService);

    app.use(
        session({
            name: 'nestforge.sid',
            secret: process.env.SESSION_SECRET as string,
            resave: false,
            saveUninitialized: false,
            store: new PrismaSessionStore(prisma, {
                checkPeriod: 2 * 60 * 1000,
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
            }),
            cookie: {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: Number(
                    process.env.SESSION_MAX_AGE ?? 7 * 24 * 60 * 60 * 1000,
                ),
            },
        }),
    );
    // nestforge:feature:auth:session:end

    // mesmos pipes/filters/interceptors globais do main.ts, pra testar o comportamento real da API
    // nestforge:feature:validation
    app.useGlobalPipes(new ZodValidationPipe());
    // nestforge:feature:validation:end
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    await app.init();
    return app;
}