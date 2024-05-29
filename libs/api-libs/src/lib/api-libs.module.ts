import { PegaUserApiModule } from './pega-user/pega-user-api.module';
import { Module } from '@nestjs/common';
const generatedModules = [PegaUserApiModule];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class ApiLibsModule {}
