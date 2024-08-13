import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import { from } from 'rxjs';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class DataDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'data');
  }

  getDataObjects({ headers }: any) {
    return from(
      axios
        .get(environment.pega.basev2Url + environment.DATAOBJECTS, {
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
  getDataPages({ headers }: any) {
    return from(
      axios
        .get(environment.pega.basev2Url + environment.DATAPAGES, {
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
  getDataPageView({ headers, id }: any) {
    return from(
      axios
        .get(environment.pega.basev2Url + environment.DATAVIEWS + `/${id}`, {
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
  getDataPageViewMetaData({ headers, id }: any) {
    return from(
      axios
        .get(
          environment.pega.basev2Url +
            environment.DATAVIEWS +
            `/${id}` +
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
