import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaseTypesDomainModule } from 'libs/domain-libs/src/lib/case-types/case-types-domain.module';
import { DataDomainModule } from 'libs/domain-libs/src/lib/data/data-domain.module';
import { AssignmentApiModule } from 'libs/api-libs/src/lib/assignment/assignment-api.module';
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
