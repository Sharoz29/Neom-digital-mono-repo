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
import { Observable } from 'rxjs';

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
    try {
      return this.client.send(PSCASE_TYPES.GETV1, {
        headers: req.headers,
      });
    } catch (error: any) {
      // console.error('Error sending message to microservice:', error);
      throw new HttpException('Error sending message to microservice', error);
    }
  }
  getCaseTypeById(id: string, req: Request): Observable<CaseTypeVm> {
    try {
      return this.client.send(PSCASE_TYPES.GETONEV1, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
}
