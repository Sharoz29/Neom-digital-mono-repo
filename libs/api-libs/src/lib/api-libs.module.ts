import { CaseTypesApiModule } from './case-types/case-types-api.module';
import { DataApiModule } from './data/data-api.module';
import { AssignmentApiModule } from './assignment/assignment-api.module';
import { CaseApiModule } from './case/case-api.module';
import { IotMqttApiModule } from './iot-mqtt/iot-mqtt-api.module';
import { Module } from '@nestjs/common';
const generatedModules = [
  CaseTypesApiModule,
  DataApiModule,
  AssignmentApiModule,
  CaseApiModule,
  IotMqttApiModule,
];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class ApiLibsModule {}
