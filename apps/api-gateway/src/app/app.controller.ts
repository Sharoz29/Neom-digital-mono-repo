import { Controller, Get, UseInterceptors } from '@nestjs/common';

import { AppService } from './app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';

@Controller("py")
@ApiTags("Neom API")
export class AppController {
  constructor(private readonly appService: AppService) {}
}
