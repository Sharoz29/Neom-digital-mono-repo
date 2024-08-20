import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { redisStore } from 'cache-manager-redis-store';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { environment } from '@neom/shared/lib/environments/dev';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';
import { DxVersioningMiddleware, NstLibsModule } from '@neom/nst-libs';

import { CaseTypesApiController } from './case-types-api.controller';
import { CaseTypesApiService } from './case-types-api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    NstLibsModule,
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
    HttpModule,
  ],
  controllers: [CaseTypesApiController],
  providers: [CaseTypesApiService],
})
export class CaseTypesApiModule {}
// export class CaseTypesApiModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(DxVersioningMiddleware)
//       .forRoutes({ path: 'v1/casetypes', method: RequestMethod.ALL });
//   }
// }
