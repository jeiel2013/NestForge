import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ClassSerializerInterceptor } from '@nestjs/common';
// nestforge:feature:validation
import { ZodValidationPipe } from 'nestjs-zod';
// nestforge:feature:validation:end
// nestforge:feature:swagger
import { patchNestJsSwagger } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// nestforge:feature:swagger:end
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// nestforge:feature:auth:session
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaService } from './database/prisma.service';
// nestforge:feature:auth:session:end

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  // nestforge:feature:auth:session
  const prisma = app.get(PrismaService);

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: Number(process.env.SESSION_MAX_AGE ?? 7 * 24 * 60 * 60 * 1000),
      },
    }),
  );
  // nestforge:feature:auth:session:end
  const corsOrigins = (
    process.env.CORS_ORIGINS ?? 'http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  // nestforge:feature:validation
  app.useGlobalPipes(new ZodValidationPipe());
  // nestforge:feature:validation:end
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // nestforge:feature:swagger
  patchNestJsSwagger();

  const config = new DocumentBuilder()
    .setTitle('NestForge API')
    .setDescription('Production-ready NestJS starter API docs')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  // nestforge:feature:swagger:end

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();