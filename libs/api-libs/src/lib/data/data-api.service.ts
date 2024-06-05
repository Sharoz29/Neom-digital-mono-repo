import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../services/baseapi.service';
import { DataVm, PSDATA } from '@neom/models';

@Injectable()
export class DataApiService extends BaseApiService<DataVm, DataVm, DataVm> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'data', cacheManagerRef);
  }
  async getData(params: string, req: Request) {
    try {
      return this.client.send(PSDATA.GET, {
        headers: req.headers,
        params,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
}
