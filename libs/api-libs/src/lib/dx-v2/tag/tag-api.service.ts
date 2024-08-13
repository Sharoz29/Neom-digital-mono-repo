import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { PSTAG } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class TagApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'tag', cacheManagerRef);
  }
  getCaseTags(caseId: string, req: Request) {
    try {
      return this.client.send(PSTAG.GETONE, {
        headers: req.headers,
        caseId,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
}
