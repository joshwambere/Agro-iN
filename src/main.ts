import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const whitelist = [
    'https://equity-dash-rh4eblbbd-joshwambere.vercel.app',
    'http://localhost:3000',
    'http://localhost:4000',
    'https://equity-back-end.herokuapp.com',
    'https://equity-back-end.herokuapp.com/api/docs',
    'https://equity-dash-dun.vercel.app',
    'https://equity-dash-joshwambere.vercel.app',
    'https://equity-dash-bqkjku1zs-joshwambere.vercel.app',
  ];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });
  const config = new DocumentBuilder()
    .setTitle('Equity Rest API')
    .setDescription('The Equity crowdfunding API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const Port: number = parseInt(process.env.PORT) || 3000;
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());

  await app.listen(Port, () => {
    console.info(`=====================================`);
    console.info(`🚀 App listening on the port: ${Port}`);
    console.info(`=====================================`);
  });
}
bootstrap();
