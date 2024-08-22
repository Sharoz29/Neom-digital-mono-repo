import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { CaseVm, PSCASE } from '@neom/models';
import { Observable } from 'rxjs';

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
    try {
      return this.client.send(PSCASE.GETV1, {
        headers: req.headers,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getCaseById(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCASE.GETONEV1, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }

  getCaseActions(
    caseId: string,
    actionId: string,
    req: Request
  ): Observable<any> {
    try {
      return this.client.send(PSCASE.GETACTIONSV1, {
        headers: req.headers,
        caseId,
        actionId,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getCasePage(caseId: string, pageId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCASE.GETPAGEV1, {
        headers: req.headers,
        caseId,
        pageId,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getCaseView(caseId: string, viewId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCASE.GETVIEWV1, {
        headers: req.headers,
        caseId,
        viewId,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
}
