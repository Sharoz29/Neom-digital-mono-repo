/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { AppModule } from './app/app.module';
import { RMQQueues } from '@neom/shared';
import { environment } from '@neom/shared/lib/environments/dev';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [environment.rabbitmq.url],
      queue: RMQQueues.PY_WORKER_QUEUE,
      queueOptions: {
        durable: false
      },
    },
  });
  await app.listen().then(() => {
    new Logger().log('Py-Worker Microservice is listening', 'STARTUP');
  });

}

bootstrap();
