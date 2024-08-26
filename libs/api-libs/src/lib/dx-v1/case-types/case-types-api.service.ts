import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import {
  CaseTypeActionsVm,
  CaseTypeResponseVm,
  CaseTypeVm,
  CaseTypesVm,
  PSCASE_TYPES,
} from '@neom/models';
import { catchError, Observable } from 'rxjs';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class CaseTypesApiService extends BaseApiService<
  CaseTypesVm,
  CaseTypesVm,
  CaseTypesVm
> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'caseTypes', cacheManagerRef);
  }

  getCaseTypes(req: Request): Observable<CaseTypeResponseVm> {

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
  getCaseTypeById(id: string, req: Request): Observable<CaseTypeVm> {

      return this.client.send(PSCASE_TYPES.GETONE, {
        headers: req.headers,
        id,
      })
      .pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
}
