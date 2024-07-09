import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import { DataVm } from '@neom/models';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';
import { from } from 'rxjs';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class DataDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'data');
  }

  getData({ headers, id }: any) {
    return from(
      axios
        .get(environment.pega.basev1Url + `/${environment.DATA}/${id}`, {
          headers: { Authorization: headers.authorization },
        })
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          return Promise.reject(error);
        })
    );
  }
  getDataMetaData({ headers, id }: any) {
    return from(
      axios
        .get(
          environment.pega.basev1Url +
            `/${environment.DATA}/${id}` +
            environment.METADATA,
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          return Promise.reject(error);
        })
    );
  }
}
