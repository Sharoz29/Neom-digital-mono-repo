import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class ParticipantDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'participant');
  }

  getParticipantsOfACase({ headers, caseId }: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.CASES +
              `/${caseId}` +
              environment.PARTICIPANTS
          ),
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }
  getParticipantOfACaseById({ headers, caseId, participantId }: any) {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.CASES +
              `/${caseId}` +
              environment.PARTICIPANTS +
              `/${participantId}`
          ),
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }
  getParticipantRoles({ headers, caseId }: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.CASES +
              `/${caseId}` +
              environment.PARTICIPANTROLES
          ),
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }
  getParticipantRoleDetails({
    headers,
    caseId,
    participantRoleId,
  }: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.CASES +
              `/${caseId}` +
              environment.PARTICIPANTROLES +
              `/${participantRoleId}`
          ),
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }
}
