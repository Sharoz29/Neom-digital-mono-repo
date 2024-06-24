import { CaseTypesDomainModule as CaseTypesV1DomainModule } from './dx-v1/case-types/case-types-domain.module';
import { DataDomainModule as DataV1DomainModule } from './dx-v1/data/data-domain.module';
import { AssignmentDomainModule as AssignmentV1DomainModule } from './dx-v1/assignment/assignment-domain.module';
import { CaseDomainModule as CaseV1DomainModule } from './dx-v1/case/case-domain.module';
import { AttachmentDomainModule as AttachmentV1DomainModule } from './dx-v1/attachment/attachment-domain.module';
import { CollaborationDomainModule } from '../lib/dx-v1/collaboration/collaboration-domain.module';
import { AssignmentDomainModule as AssignmentV2DomainModule } from './dx-v2/assignment/assignment-domain.module';
import { AttachmentDomainModule as AttachmentV2DomainModule } from './dx-v2/attachment/attachment-domain.module';
import { CaseDomainModule as CaseV2DomainModule } from './dx-v2/case/case-domain.module';
import { CaseTypesDomainModule as CaseTypesV2DomainModule } from './dx-v2/case-types/case-types-domain.module';
import { DataDomainModule as DataV2DomainModule } from './dx-v2/data/data-domain.module';
import { DocumentDomainModule } from './dx-v2/document/document-domain.module';
import { FollowerDomainModule } from './dx-v2/follower/follower-domain.module';
import { ParticipantDomainModule } from './dx-v2/participant/participant-domain.module';
// import { RelatedCaseDomainModule } from './related-case/related-case-domain.module';
import { DynamicModule, Module } from '@nestjs/common';
import { IotMqttDomainModule } from './iot-mqtt/iot-mqtt-domain.module';
const generatedModules = [
  // IotMqttDomainModule,
  CaseTypesV1DomainModule,
  DataV1DomainModule,
  AssignmentV1DomainModule,
  CaseV1DomainModule,
  AttachmentV1DomainModule,
  CollaborationDomainModule,
  AssignmentV2DomainModule,
  AttachmentV2DomainModule,
  CaseV2DomainModule,
  CaseTypesV2DomainModule,
  DataV2DomainModule,
  DocumentDomainModule,
  FollowerDomainModule,
  ParticipantDomainModule,
  // RelatedCaseDomainModule,
];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class DomainLibsModule {}
