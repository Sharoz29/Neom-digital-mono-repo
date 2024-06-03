import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaseTypesDomainModule } from 'libs/domain-libs/src/lib/case-types/case-types-domain.module';
import { WorklistDomainModule } from 'libs/domain-libs/src/lib/worklist/worklist-domain.module';
import { OperatorIdDomainModule } from 'libs/domain-libs/src/lib/operator-id/operator-id-domain.module';

@Module({
  imports: [
    // UserDomainModule,
    // CaseModule,
    CaseTypesDomainModule,
    WorklistDomainModule,
    OperatorIdDomainModule,
  ],
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
