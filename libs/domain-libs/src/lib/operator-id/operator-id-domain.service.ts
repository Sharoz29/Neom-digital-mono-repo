import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../services/domain.service';
import { OperatorIdVm } from '@neom/models';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class OperatorIdDomainService extends BaseDomainService<
  OperatorIdVm,
  OperatorIdVm,
  OperatorIdVm
> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'operatorId');
  }

  /**
   * Specialized Methods Come below:
   */
  async getOperatorId({ authorization }: any) {
    return axios
      .get(environment.pega.basev1Url + environment.OPERATORID, {
        headers: { Authorization: authorization },
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return Promise.reject(error);
      });
  }
}
