import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { CaseVm, PSCASE } from '@neom/models';
import { catchError, Observable } from 'rxjs';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class CaseApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'case', cacheManagerRef);
  }
  getCases(req: Request): Observable<any> {

      return this.client.send(PSCASE.GET, {
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
  getCasePage(caseId: string, pageId: string, req: Request): Observable<any> {

      return this.client.send(PSCASE.GETPAGE, {
        headers: req.headers,
        caseId,
        pageId,
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
