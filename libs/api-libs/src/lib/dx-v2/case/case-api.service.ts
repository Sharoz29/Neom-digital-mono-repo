import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { Observable } from 'rxjs';
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
    try {
      return this.client.send(PSCASE.GETONE, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getCaseAncestors(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCASE.GETANCESTORS, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getCaseDescendants(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCASE.GETDESCENDANTS, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getCaseStages(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCASE.GETSTAGES, {
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
      return this.client.send(PSCASE.GETACTIONS, {
        headers: req.headers,
        caseId,
        actionId,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getCaseView(caseId: string, viewId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCASE.GETVIEW, {
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
