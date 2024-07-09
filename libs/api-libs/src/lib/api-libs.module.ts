import { CaseTypesApiModule as CaseTypesV1ApiModule } from './dx-v1/case-types/case-types-api.module';
import { DataApiModule as DataV1ApiModule } from './dx-v1/data/data-api.module';
import { AssignmentApiModule as AssignmentV1ApiModule } from './dx-v1/assignment/assignment-api.module';
import { CaseApiModule as CaseV1ApiModule } from './dx-v1/case/case-api.module';
import { IotMqttApiModule } from './iot-mqtt/iot-mqtt-api.module';
import { AttachmentApiModule as AttachmentV1ApiModule } from './dx-v1/attachment/attachment-api.module';
import { CollaborationApiModule } from './dx-v1/collaboration/collaboration-api.module';
import { AssignmentApiModule as AssignmentV2ApiModule } from './dx-v2/assignment/assignment-api.module';
import { AttachmentApiModule as AttachmentV2ApiModule } from './dx-v2/attachment/attachment-api.module';
import { CaseApiModule as CaseV2ApiModule } from './dx-v2/case/case-api.module';
import { CaseTypesApiModule as CaseTypesV2ApiModule } from './dx-v2/case-types/case-types-api.module';
import { DataApiModule as DataV2ApiModule } from './dx-v2/data/data-api.module';
import { DocumentApiModule } from './dx-v2/document/document-api.module';
import { FollowerApiModule } from './dx-v2/follower/follower-api.module';
import { ParticipantApiModule } from './dx-v2/participant/participant-api.module';
import { RelatedCaseApiModule } from './dx-v2/related-case/related-case-api.module';
import { TagApiModule } from './dx-v2/tag/tag-api.module';
import { PageApiModule } from './dx-v2/page/page-api.module';
import { Module } from '@nestjs/common';
const generatedModules = [
  CaseTypesV1ApiModule,
  DataV1ApiModule,
  AssignmentV1ApiModule,
  CaseV1ApiModule,
  // IotMqttApiModule,
  AttachmentV1ApiModule,
  CollaborationApiModule,
  AssignmentV2ApiModule,
  AttachmentV2ApiModule,
  CaseV2ApiModule,
  CaseTypesV2ApiModule,
  DataV2ApiModule,
  DocumentApiModule,
  FollowerApiModule,
  ParticipantApiModule,
  RelatedCaseApiModule,
  TagApiModule,
  PageApiModule,
];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class ApiLibsModule {}
