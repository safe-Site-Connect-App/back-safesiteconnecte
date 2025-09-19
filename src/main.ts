import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import * as bodyParser from 'body-parser'; // Import body parser for file handling

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for cross-origin requests (optional based on your needs)
  app.enableCors();

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable body parser for handling large files (optional, adjust limit as needed)
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Swagger Test')
    .setDescription('This is the test of the Swagger API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Define example goal and time
  const goal = "Lose weight";  // Example goal, adjust as needed
  const time = 30;  // Example time, adjust as needed




  // Start the application
  await app.listen(3000);
}
bootstrap();
