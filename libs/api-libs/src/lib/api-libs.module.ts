import { CaseTypesApiModule } from './dx-v1/case-types/case-types-api.module';
import { DataApiModule } from './dx-v1/data/data-api.module';
import { AssignmentApiModule } from './dx-v1/assignment/assignment-api.module';
import { CaseApiModule } from './dx-v1/case/case-api.module';
import { IotMqttApiModule } from './iot-mqtt/iot-mqtt-api.module';
import { AttachmentApiModule } from './dx-v1/attachment/attachment-api.module';
import { CollaborationApiModule } from './dx-v1/collaboration/collaboration-api.module';
import { Module } from '@nestjs/common';
const generatedModules = [
  CaseTypesApiModule,
  DataApiModule,
  AssignmentApiModule,
  CaseApiModule,
  IotMqttApiModule,
  AttachmentApiModule,
  CollaborationApiModule,
];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class ApiLibsModule {}
