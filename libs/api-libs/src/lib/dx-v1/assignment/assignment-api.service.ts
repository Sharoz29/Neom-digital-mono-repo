import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { AssignmentVm, PSASSIGNMENT } from '@neom/models';
import { Observable } from 'rxjs';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class AssignmentApiService extends BaseApiService<any, any, any> {
  constructor(
    // @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'assignment');
  }

  getAssignments(req: Request): Observable<any> {
    try {
      return this.client.send(PSASSIGNMENT.GET, {
        headers: req.headers,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getAssignmentById(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSASSIGNMENT.GETONE, {
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
      return this.client.send(PSASSIGNMENT.GETACTIONS, {
        headers: req.headers,
        assignmentId,
        actionId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
}
