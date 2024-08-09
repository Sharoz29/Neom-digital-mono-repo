import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlfrescoMockApiModule } from '@neom/api-libs';

@Module({
  imports: [AlfrescoMockApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
