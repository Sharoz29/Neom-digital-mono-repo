import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import { CaseVm } from '@neom/models';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';
import { from } from 'rxjs';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class CaseDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'case');
  }

  getCases({ authorization }: any) {
    return from(
      axios
        .get(encodeURI(environment.pega.basev1Url + environment.CASES), {
          headers: { Authorization: authorization },
        })
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getCaseById({ headers, id }: any) {
    return from(
      axios
        .get(
          encodeURI(environment.pega.basev1Url + environment.CASES + `/${id}`),
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
            environment.pega.basev1Url +
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
  getCasePage(payload: any) {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev1Url +
              environment.CASES +
              `/${payload.caseId}` +
              environment.PAGES +
              `/${payload.pageId}`
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
