import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import { AssignmentVm } from '@neom/models';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';
import { Observable, from } from 'rxjs';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class AssignmentDomainService extends BaseDomainService<
  AssignmentVm,
  AssignmentVm,
  AssignmentVm
> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'assignment');
  }

  getAssignments({ headers }: any): Observable<any> {
    return from(
      axios
        .get(environment.pega.basev1Url + environment.ASSIGNMENTS, {
          headers: { Authorization: headers?.authorization },
        })
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          return Promise.reject(error);
        })
    );
  }
  getAssignmentById({ headers, id }: any): Observable<any> {
    return from(
      axios
        .get(environment.pega.basev1Url + environment.ASSIGNMENTS + `/${id}`, {
          headers: { Authorization: headers.authorization },
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => Promise.reject(error))
    );
  }
  getActionsForAssignment(payload: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev1Url +
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
          return response.data;
        })
        .catch((error) => Promise.reject(error.message))
    );
  }
}
