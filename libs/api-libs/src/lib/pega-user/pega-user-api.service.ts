import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../services/baseapi.service';
import { PegaUserCreateVm, PegaUserVm } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class PegaUserApiService extends BaseApiService<PegaUserVm, PegaUserCreateVm, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'PegaUser', cacheManagerRef);
  }

  /**
   * Specialized Methods Come below:
   */
}
