import { Module } from '@nestjs/common';
import { ParseObjectPipe } from './pipes/parseobject.pipe';

@Module({
  controllers: [],
  providers: [ParseObjectPipe],
  exports: [ParseObjectPipe],
})
export class NstLibsModule {}
