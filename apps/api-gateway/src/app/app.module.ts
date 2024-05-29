import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { redisStore } from 'cache-manager-redis-store';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { environment } from '@neom/shared/lib/environments/dev';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

@Module({
  imports: [
    UserModule,

    CacheModule.registerAsync({
      // imports: [ConfigModule],
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: environment.redis.host,
            port: environment.redis.port,
          },
        });

        return {
          store: store as unknown as CacheStore,
          ttl: 60 * 60 * 24 * 7,
        };
      },
      // inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: RMQQueues.PY_WORKER_QUEUE,
        transport: Transport.RMQ,
        options: {
          urls: [environment.rabbitmq.url],
          queue: RMQQueues.PY_WORKER_QUEUE,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
