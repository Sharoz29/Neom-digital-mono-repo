import { Module } from '@nestjs/common';

import { environment } from '@neom/shared/lib/environments/dev';
import { redisStore } from 'cache-manager-redis-store';
import { NstLibsModule } from '@neom/nst-libs';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { PegaUserDomainController } from './pega-user-domain.controller';
import { PegaUserDomainService } from './pega-user-domain.service';

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
        transport: Transport.TCP,
      },
    ]),
  ],
  controllers: [PegaUserDomainController],
  providers: [PegaUserDomainService],
})
export class PegaUserDomainModule {}
