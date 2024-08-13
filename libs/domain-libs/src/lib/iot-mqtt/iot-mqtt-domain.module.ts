import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { environment } from '@neom/shared/lib/environments/dev';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IoTQueues } from '@neom/shared';
import { NstLibsModule } from '@neom/nst-libs';

import { IotMqttDomainController } from './iot-mqtt-domain.controller';
import { IotMqttDomainService } from './iot-mqtt-domain.service';

/**
 * Module to provide MQTT domain services for IoT.
 * Configures caching, MQTT clients, and imports necessary libraries.
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
        transport: Transport.RMQ, // Updated to match RMQ transport
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
  controllers: [IotMqttDomainController],
  providers: [IotMqttDomainService],
})
export class IotMqttDomainModule {}
