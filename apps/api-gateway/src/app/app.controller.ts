import { Controller, Get, UseInterceptors } from '@nestjs/common';

import { AppService } from './app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // @UseInterceptors(CacheInterceptor)
  getData() {
    return this.appService.getData();
  }
}
