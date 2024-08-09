/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
    });
    app.enableCors();
    
    const globalPrefix = 'afco';
    app.setGlobalPrefix(globalPrefix);

    const config = new DocumentBuilder()
      .setTitle('Neom Digital Alfresco Mock API Docs')
      .setDescription('The Neom Digital Alfresco Mock API for Predev Mock Development of Pega Repository Integration')
      .setVersion('1.0')
      .setBasePath('/afco')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    app.use('afco/docs/swagger.json', (req, res) => res.send(document));
    SwaggerModule.setup('afco/docs', app, document);


    const port = process.env.PORT || 3001;
    await app.listen(port);

    Logger.log(
      `Mock Alfresco API 🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
    );
}

bootstrap();
