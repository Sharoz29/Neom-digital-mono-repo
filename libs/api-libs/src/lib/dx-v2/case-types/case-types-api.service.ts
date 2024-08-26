import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { catchError, Observable } from 'rxjs';
import { PSCASE_TYPES } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class CaseTypesApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'caseTypes', cacheManagerRef);
  }

  getCaseTypes(req: Request): Observable<any> {

      return this.client.send(PSCASE_TYPES.GET, {
        headers: req.headers,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getCaseTypeActions(
    caseTypeid: string,
    actionId: string,
    req: Request
  ): Observable<any> {

      return this.client.send(PSCASE_TYPES.GETCASETYPEACTIONS, {
        headers: req.headers,
        caseTypeid,
        actionId,
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
