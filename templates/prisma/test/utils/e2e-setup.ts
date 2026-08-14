import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
// nestforge:feature:validation
import { ZodValidationPipe } from 'nestjs-zod';
// nestforge:feature:validation:end
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

export async function createTestApp(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication<NestExpressApplication>();

    // mesmos pipes/filters/interceptors globais do main.ts, pra testar o comportamento real da API
    // nestforge:feature:validation
    app.useGlobalPipes(new ZodValidationPipe());
    // nestforge:feature:validation:end
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    await app.init();
    return app;
}