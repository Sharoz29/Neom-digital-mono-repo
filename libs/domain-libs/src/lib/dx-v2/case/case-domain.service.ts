import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class CaseDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'case');
  }

  getCaseById({ headers, id }: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(environment.pega.basev2Url + environment.CASES + `/${id}`),
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then(function (response) {
          return response.data;
        })
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getCaseAncestors({ headers, id }: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.CASES +
              `/${id}` +
              environment.ANCESTORS
          ),
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then(function (response) {
          return response.data;
        })
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getCaseDescendants({ headers, id }: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.CASES +
              `/${id}` +
              environment.DESCENDANTS
          ),
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then(function (response) {
          return response.data;
        })
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getCaseStages({ headers, id }: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.CASES +
              `/${id}` +
              environment.STAGES
          ),
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then(function (response) {
          return response.data;
        })
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getCaseActions(payload: any) {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev2Url +
              environment.CASES +
              `/${payload.caseId}` +
              environment.ACTIONS +
              `/${payload.actionId}`
          ),
          {
            headers: { Authorization: payload.headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getCaseView(payload: any) {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev1Url +
              environment.CASES +
              `/${payload.caseId}` +
              environment.VIEWS +
              `/${payload.viewId}`
          ),
          {
            headers: { Authorization: payload.headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
}
