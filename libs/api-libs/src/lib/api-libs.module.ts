import { PegaUserApiModule } from './pega-user/pega-user-api.module';
import { CaseTypesApiModule } from './case-types/case-types-api.module';
import { DataApiModule } from './data/data-api.module';
import { AssignmentApiModule } from './assignment/assignment-api.module';
import { CaseApiModule } from './case/case-api.module';
import { Module } from '@nestjs/common';
const generatedModules = [
  PegaUserApiModule,
  CaseTypesApiModule,
  DataApiModule,
  AssignmentApiModule,
  CaseApiModule,
];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class ApiLibsModule {}
