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
export class AssignmentDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'assignment');
  }

  getAssignmentById({ headers, id }: any): Observable<any> {
    return from(
      axios
        .get(environment.pega.basev2Url + environment.ASSIGNMENTS + `/${id}`, {
          headers: { Authorization: headers.authorization },
        })
        .then((response) => {
          const { data } = response.data;
          return data;
        })
        .catch((error) => Promise.reject(error))
    );
  }
  getActionsForAssignment(payload: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.ASSIGNMENTS +
              `/${payload.assignmentId}` +
              environment.ACTIONS +
              `/${payload.actionId}`
          ),
          {
            headers: { Authorization: payload.headers.authorization },
          }
        )
        .then((response) => {
          const { data } = response.data;
          return data;
        })
        .catch((error) => Promise.reject(error.message))
    );
  }
  getNextAssignmentDetail(payload: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.ASSIGNMENTS +
              environment.NEXT
          ),
          {
            headers: { Authorization: payload.headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => Promise.reject(error.message))
    );
  }
}
