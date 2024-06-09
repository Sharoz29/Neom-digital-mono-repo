import { CaseTypesDomainModule } from './case-types/case-types-domain.module';
import { DataDomainModule } from './data/data-domain.module';
import { AssignmentDomainModule } from './assignment/assignment-domain.module';
import { CaseDomainModule } from './case/case-domain.module';
import { DynamicModule, Module } from '@nestjs/common';
import { PegaUserDomainModule } from './pega-user/pega-user-domain.module';
import { IotMqttDomainModule } from './iot-mqtt/iot-mqtt-domain.module';
const generatedModules = [
  PegaUserDomainModule,
  IotMqttDomainModule,
  CaseTypesDomainModule,
  DataDomainModule,
  AssignmentDomainModule,
  CaseDomainModule,
];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class DomainLibsModule {}
