import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../services/baseapi.service';
import { OperatorIdVm, PSOPERATOR_ID } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class OperatorIdApiService extends BaseApiService<
  OperatorIdVm,
  OperatorIdVm,
  OperatorIdVm
> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'operatorId', cacheManagerRef);
  }

  async getOperatorID(req: Request) {
    try {
      const response = this.client.send(PSOPERATOR_ID.GET, {
        headers: req.headers,
      });
      const worklist = await response.toPromise();
      return worklist;
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
}
