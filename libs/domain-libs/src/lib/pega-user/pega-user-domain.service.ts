import { BaseDomainService } from '../services/domain.service';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';


// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class PegaUserDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
  ) {
    super(_client,cacheManagerRef, 'Pega User');
  }


  /**
   * All Specialized Methods Come below:
   */

  
}
