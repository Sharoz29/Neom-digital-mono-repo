import { PegaUserDomainModule } from './pega-user/pega-user-domain.module';
import { DynamicModule, Module } from '@nestjs/common';
const generatedModules = [PegaUserDomainModule];
@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class DomainLibsModule {}
