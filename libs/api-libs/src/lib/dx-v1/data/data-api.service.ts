import { Injectable, Inject, ParamData, HttpException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { DataVm, PSDATA } from '@neom/models';
import { catchError, Observable } from 'rxjs';

@Injectable()
export class DataApiService extends BaseApiService<DataVm, DataVm, DataVm> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'data', cacheManagerRef);
  }
  getData(id: string, req: Request, query?: any): Observable<any> {

      return this.client.send(PSDATA.GET, {
        headers: req.headers,
        id,
        query,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getDataMetaData(id: string, req: Request): Observable<any> {

      return this.client.send(PSDATA.GETMETADATA, {
        headers: req.headers,
        id,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
}
