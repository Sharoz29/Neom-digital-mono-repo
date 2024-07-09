import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainLibsModule } from '@neom/domain-libs';

@Module({
  imports: [DomainLibsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'HOSTID',
      useValue: Math.round(Math.random() * 100),
    },
  ],
})
export class AppModule {}
