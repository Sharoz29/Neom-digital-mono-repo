import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { catchError, Observable } from 'rxjs';
import { PSASSIGNMENT } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class AssignmentApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'assignment', cacheManagerRef);
  }

  getAssignmentById(id: string, req: Request): Observable<any> {
    return this.client
      .send(PSASSIGNMENT.GETONEV2, {
        headers: req.headers,
        id,
      })
      .pipe(
        catchError((error) => {
          throw new HttpException(error.message, error?.status);
        })
      );
  }
  getActionsForAssignment(
    assignmentId: string,
    actionId: string,
    req: Request
  ): Observable<any> {
    return this.client
      .send(PSASSIGNMENT.GETACTIONSV2, {
        headers: req.headers,
        assignmentId,
        actionId,
      })
      .pipe(
        catchError((error) => {
          throw new HttpException(error.message, error?.status);
        })
      );
  }
  getNextAssignmentDetail(req: Request): Observable<any> {
    return this.client
      .send(PSASSIGNMENT.GETNEXTV2, {
        headers: req.headers,
      })
      .pipe(
        catchError((error) => {
          throw new HttpException(error.message, error?.status);
        })
      );
  }
}
