import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../services/domain.service';
import { AssignmentVm } from '@neom/models';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';

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

  async getAssignments({ headers }: any) {
    return axios
      .get(environment.pega.baseUrl + environment.ASSIGNMENTS, {
        headers: { Authorization: headers.authorization },
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return Promise.reject(error);
      });
  }
  async getAssignmentById({ headers, params }: any) {
    return axios
      .get(environment.pega.baseUrl + environment.ASSIGNMENTS + `/${params}`, {
        headers: { Authorization: headers.authorization },
      })
      .then((response) => response.data)
      .catch((error) => Promise.reject(error));
  }
  async getFieldsForAssignment(payload: any) {
    return axios
      .get(
        encodeURI(
          environment.pega.baseUrl +
            environment.ASSIGNMENTS +
            `/${payload.assignmentId}` +
            environment.ACTIONS +
            `/${payload.actionId}`
        ),
        {
          headers: { Authorization: payload.headers.authorization },
        }
      )
      .then((response) => response.data)
      .catch((error) => Promise.reject(error.message));
  }
}
