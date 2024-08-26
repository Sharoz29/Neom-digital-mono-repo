import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { catchError, Observable } from 'rxjs';
import { PSCASE } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class CaseApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'case', cacheManagerRef);
  }

  getCaseById(id: string, req: Request): Observable<any> {

      return this.client.send(PSCASE.GETONE, {
        headers: req.headers,
        id,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getCaseAncestors(id: string, req: Request): Observable<any> {
   
      return this.client.send(PSCASE.GETANCESTORS, {
        headers: req.headers,
        id,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getCaseDescendants(id: string, req: Request): Observable<any> {
  
      return this.client.send(PSCASE.GETDESCENDANTS, {
        headers: req.headers,
        id,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getCaseStages(id: string, req: Request): Observable<any> {

      return this.client.send(PSCASE.GETSTAGES, {
        headers: req.headers,
        id,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getCaseActions(
    caseId: string,
    actionId: string,
    req: Request
  ): Observable<any> {
 
      return this.client.send(PSCASE.GETACTIONS, {
        headers: req.headers,
        caseId,
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
  getCaseView(caseId: string, viewId: string, req: Request): Observable<any> {

      return this.client.send(PSCASE.GETVIEW, {
        headers: req.headers,
        caseId,
        viewId,
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
