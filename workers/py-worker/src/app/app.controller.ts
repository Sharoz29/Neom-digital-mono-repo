import { Controller, Get, Inject, Logger } from '@nestjs/common';

import { AppService } from './app.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessagePatterns } from '@neom/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('HOSTID') private hid) {}
  logger = new Logger('PYWORKER');
  
  @MessagePattern({cmd: MessagePatterns.PY_HOST_INFO})
  getHostInfo(@Payload() data: any, @Ctx() context: RmqContext) {
    return this.appService.getData(this.hid);
  }
}
