import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors();
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