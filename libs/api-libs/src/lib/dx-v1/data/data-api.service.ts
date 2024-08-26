import { Injectable, Inject, ParamData } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { DataVm, PSDATA } from '@neom/models';
import { Observable } from 'rxjs';

@Injectable()
export class DataApiService extends BaseApiService<DataVm, DataVm, DataVm> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'data', cacheManagerRef);
  }
  getData(id: string, req: Request, query?: any): Observable<any> {
    try {
      return this.client.send(PSDATA.GETV1, {
        headers: req.headers,
        id,
        query,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getDataMetaData(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSDATA.GETMETADATAV1, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
}
