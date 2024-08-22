import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { PSFOLLOWER } from '@neom/models';
import { Observable } from 'rxjs';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class FollowerApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'follower', cacheManagerRef);
  }

  getCaseFollowers(caseId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSFOLLOWER.GETCASEFOLLOWERSV2, {
        headers: req.headers,
        caseId,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
}
