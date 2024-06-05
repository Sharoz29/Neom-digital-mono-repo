import { Controller, Get, Param, Post, Body, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, MessagePattern, Payload, MqttContext } from '@nestjs/microservices';


@Controller()
export class AppController {
  private readonly logger = new Logger('IoT Worker');

  constructor(
    private readonly appService: AppService,
  ) {}

  @MessagePattern('#')
getData(@Ctx() context: MqttContext) {
  return this.appService.getData();
}

}
