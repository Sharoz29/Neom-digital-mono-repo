import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { Observable } from 'rxjs';
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
    try {
      return this.client.send(PSASSIGNMENT.GETONEV2, {
        headers: req.headers,
        id,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getActionsForAssignment(
    assignmentId: string,
    actionId: string,
    req: Request
  ): Observable<any> {
    try {
      return this.client.send(PSASSIGNMENT.GETACTIONSV2, {
        headers: req.headers,
        assignmentId,
        actionId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getNextAssignmentDetail(req: Request): Observable<any> {
    try {
      return this.client.send(PSASSIGNMENT.GETNEXTV2, {
        headers: req.headers,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
}
