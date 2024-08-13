import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../services/baseapi.service';
import { Observable } from 'rxjs';
import { PSAPPLICATION } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class ApplicationApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'application', cacheManagerRef);
  }

  getApplications(req: Request): Observable<any> {
    try {
      return this.client.send(PSAPPLICATION.GET, {
        headers: req.headers,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getApplicationVersion(req: Request): Observable<any> {
    try {
      return this.client.send(PSAPPLICATION.GETVERSION, {
        headers: req.headers,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice');
      throw error;
    }
  }
}
