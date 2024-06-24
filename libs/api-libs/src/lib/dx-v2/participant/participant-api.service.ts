import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { Observable } from 'rxjs';
import { PSPARTICIPANT } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class ParticipantApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'participant', cacheManagerRef);
  }

  getParticipantsOfACase(caseId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSPARTICIPANT.GET, {
        headers: req.headers,
        caseId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getParticipantOfACaseById(
    caseId: string,
    participantId: string,
    req: Request
  ) {
    try {
      return this.client.send(PSPARTICIPANT.GETONE, {
        headers: req.headers,
        caseId,
        participantId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getParticipantRoles(caseId: string, req: Request) {
    try {
      return this.client.send(PSPARTICIPANT.GETROLES, {
        headers: req.headers,
        caseId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getParticipantRoleDetails(
    caseId: string,
    participantRoleId: any,
    req: Request
  ) {
    try {
      return this.client.send(PSPARTICIPANT.GETROLEDETAILS, {
        headers: req.headers,
        caseId,
        participantRoleId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
}
