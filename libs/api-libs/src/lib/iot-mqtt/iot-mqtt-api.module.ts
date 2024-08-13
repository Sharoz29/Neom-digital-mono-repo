import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { environment } from '@neom/shared/lib/environments/dev';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IoTQueues } from '@neom/shared';
import { NstLibsModule } from '@neom/nst-libs';

import { IotMqttApiController } from './iot-mqtt-api.controller';
import { IotMqttApiService } from './iot-mqtt-api.service';

/**
 * Module for handling IoT MQTT API operations.
 */
@Module({
  imports: [
    NstLibsModule,
    /**
     * Cache module configuration with Redis store.
     */
    CacheModule.registerAsync({
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: environment.redis.host,
            port: environment.redis.port,
          },
        });

        return {
          store: store as unknown as CacheStore,
          ttl: 60 * 60 * 24 * 7, // Time-to-live of one week.
        };
      },
    }),
    /**
     * Clients module configuration for RabbitMQ transport.
     */
    ClientsModule.register([
      {
        name: IoTQueues.IoT_WORKER_QUEUE,
        transport: Transport.RMQ,
        options: {
          urls: [environment.rabbitmq.url],
          queue: IoTQueues.IoT_WORKER_QUEUE,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [IotMqttApiController],
  providers: [IotMqttApiService],
})
export class IotMqttApiModule {}
