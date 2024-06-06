/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { IoTQueues } from '@neom/shared';
import { environment } from '@neom/shared/lib/environments/dev';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.MQTT,
    options: {
      url: `mqtt://${environment.mqtt.host}:${environment.mqtt.port}`,
      queue: IoTQueues.IoT_WORKER_QUEUE,
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.listen().then(() => {
    new Logger().log('IoT-Worker Microservice is listening', 'STARTUP');
  });
}

bootstrap();
