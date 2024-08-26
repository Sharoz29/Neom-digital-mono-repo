import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { catchError, Observable } from 'rxjs';
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

      return this.client.send(PSPARTICIPANT.GET, {
        headers: req.headers,
        caseId,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      )
  }
  getParticipantOfACaseById(
    caseId: string,
    participantId: string,
    req: Request
  ) {

      return this.client.send(PSPARTICIPANT.GETONE, {
        headers: req.headers,
        caseId,
        participantId,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      )
  }
  getParticipantRoles(caseId: string, req: Request) {
  
      return this.client.send(PSPARTICIPANT.GETROLES, {
        headers: req.headers,
        caseId,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      )
  }
  getParticipantRoleDetails(
    caseId: string,
    participantRoleId: any,
    req: Request
  ) {

      return this.client.send(PSPARTICIPANT.GETROLEDETAILS, {
        headers: req.headers,
        caseId,
        participantRoleId,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      )
  }
}
