import { CaseTypesDomainModule } from './case-types/case-types-domain.module';
import { WorklistDomainModule } from './worklist/worklist-domain.module';
import { OperatorIdDomainModule } from './operator-id/operator-id-domain.module';
import { DynamicModule, Module } from '@nestjs/common';
const generatedModules = [
  CaseTypesDomainModule,
  WorklistDomainModule,
  OperatorIdDomainModule,
];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class DomainLibsModule {}
