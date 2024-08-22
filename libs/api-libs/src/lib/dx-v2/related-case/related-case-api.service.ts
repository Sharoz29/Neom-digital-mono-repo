import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { PSRELATED_CASE } from '@neom/models';
import { catchError } from 'rxjs';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class RelatedCaseApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'relatedCase', cacheManagerRef);
  }
  getRelatedCases(caseId: string, req: Request) {
    return this.client
      .send(PSRELATED_CASE.GETONEV2, {
        headers: req.headers,
        caseId,
      })
      .pipe(
        catchError((error) => {
          throw new HttpException(error.message, error?.status);
        })
      );
  }
}
