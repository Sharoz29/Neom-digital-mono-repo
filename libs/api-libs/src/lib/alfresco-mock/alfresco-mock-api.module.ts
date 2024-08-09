import { Module } from '@nestjs/common';


import { NstLibsModule } from '@neom/nst-libs';

import { AlfrescoMockApiController } from './alfresco-mock-api.controller';
import { AlfrescoMockApiService } from './alfresco-mock-api.service';

@Module({
  imports: [
    NstLibsModule,
    
  ],
  controllers: [AlfrescoMockApiController],
  providers: [AlfrescoMockApiService,],
})
export class AlfrescoMockApiModule {}
