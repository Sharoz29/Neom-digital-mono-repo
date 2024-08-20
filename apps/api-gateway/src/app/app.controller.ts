import { Controller, Get, Inject, Req, UseInterceptors } from '@nestjs/common';

import { AppService } from './app.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { CustomCacheInterceptor } from '@neom/nst-libs/lib/interceptors/custom-cache.interceptor';
import { ClientProxy,  } from '@nestjs/microservices';
import { MessagePatterns, RMQQueues } from '@neom/shared';
import { Observable } from 'rxjs';
import { buildRMQRecord } from '@neom/utils';


@Controller('py')
@ApiTags('Neom API')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(RMQQueues.PY_WORKER_QUEUE) private readonly _client: ClientProxy
  ) {}

  @UseInterceptors(CustomCacheInterceptor)
  @CacheTTL(60*60*24*30)
  @Get()
  getHello(@Req() req): Observable<string> {
    return this._client.send({ cmd: MessagePatterns.PY_HELLO }, buildRMQRecord(req, {kuch: 'bhi'}));
  }
}
