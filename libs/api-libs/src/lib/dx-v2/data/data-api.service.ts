import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { Observable } from 'rxjs';
import { PSDATA } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class DataApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'data', cacheManagerRef);
  }

  getDataObjects(req: Request): Observable<any> {
    try {
      return this.client.send(PSDATA.GETDATAOBJECTS, {
        headers: req.headers,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getDataPages(req: Request): Observable<any> {
    try {
      return this.client.send(PSDATA.GETDATAPAGES, {
        headers: req.headers,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getDataPageView(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSDATA.GETDATAPAGEVIEWS, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getDataPageViewMetaData(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSDATA.GETDATAPAGEVIEWMETADATA, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
}
