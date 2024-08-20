import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainLibsModule } from '@neom/domain-libs';
import { CustomCacheInterceptor } from '@neom/nst-libs/lib/interceptors/custom-cache.interceptor';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { environment } from '@neom/shared/lib/environments/dev';
@Module({
  imports: [
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
    DomainLibsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'HOSTID',
      useValue: Math.round(Math.random() * 100),
    },
    CustomCacheInterceptor,
  ],
})
export class AppModule {}
