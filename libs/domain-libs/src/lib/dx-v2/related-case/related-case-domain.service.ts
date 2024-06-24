import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../services/domain.service';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class RelatedCaseDomainService extends BaseDomainService {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'relatedCase');
  }

  /**
   * Specialized Methods Come below:
   */
}
