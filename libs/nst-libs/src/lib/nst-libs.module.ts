import { Module } from '@nestjs/common';
import { ParseObjectPipe } from './pipes/parseobject.pipe';
import { ThrowErrorInterceptor } from './interceptors/throw-custom-error.interceptor';

@Module({
  controllers: [],
  providers: [ParseObjectPipe, ThrowErrorInterceptor],
  exports: [ParseObjectPipe, ThrowErrorInterceptor],
})
export class NstLibsModule {}
