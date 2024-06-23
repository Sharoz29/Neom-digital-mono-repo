import { CaseTypesDomainModule } from './dx-v1/case-types/case-types-domain.module';
import { DataDomainModule } from './dx-v1/data/data-domain.module';
import { AssignmentDomainModule } from './dx-v1/assignment/assignment-domain.module';
import { CaseDomainModule } from './dx-v1/case/case-domain.module';
import { AttachmentDomainModule } from './dx-v1/attachment/attachment-domain.module';
import { CollaborationDomainModule } from '../lib/dx-v1/collaboration/collaboration-domain.module';
import { DynamicModule, Module } from '@nestjs/common';
import { IotMqttDomainModule } from './iot-mqtt/iot-mqtt-domain.module';
const generatedModules = [
  IotMqttDomainModule,
  CaseTypesDomainModule,
  DataDomainModule,
  AssignmentDomainModule,
  CaseDomainModule,
  AttachmentDomainModule,
  CollaborationDomainModule,
];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class DomainLibsModule {}
