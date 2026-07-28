import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('NestForge API')
    .setDescription('Production-ready NestJS starter API docs')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();