import { PegaUserApiModule } from './pega-user/pega-user-api.module';
import { CaseTypesApiModule } from './case-types/case-types-api.module';
import { WorklistApiModule } from './worklist/worklist-api.module';
import { OperatorIdApiModule } from './operator-id/operator-id-api.module';
import { Module } from '@nestjs/common';
const generatedModules = [
  PegaUserApiModule,
  CaseTypesApiModule,
  WorklistApiModule,
  OperatorIdApiModule,
];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class ApiLibsModule {}
