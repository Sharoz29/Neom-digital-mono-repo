import { Controller, Get, Inject, Logger, UseInterceptors } from '@nestjs/common';

import { AppService } from './app.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessagePatterns } from '@neom/shared';
import { CustomCacheInterceptor } from '@neom/nst-libs/lib/interceptors/custom-cache.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('HOSTID') private hid) {}
  logger = new Logger('PYWORKER');
  
  @MessagePattern({cmd: MessagePatterns.PY_HOST_INFO})
  getHostInfo(@Payload() data: any, @Ctx() context: RmqContext) {
    return this.appService.getData(this.hid);
  }

  @MessagePattern({cmd: MessagePatterns.PY_HELLO})
  @UseInterceptors(CustomCacheInterceptor)
  @CacheTTL(60*60*24*30)
  getHello(@Payload() data: any, @Ctx() context: RmqContext) {
    const originalMsg = context.getMessage();
    console.log('Original Message: ', originalMsg?.properties?.headers);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Hello World!');
      }, 5000);
    });
  }
}
