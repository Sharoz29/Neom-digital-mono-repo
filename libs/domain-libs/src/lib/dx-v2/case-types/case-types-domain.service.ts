import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import { Observable, from } from 'rxjs';
import { environment } from '@neom/shared/lib/environments/dev';
import axios from 'axios';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class CaseTypesDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'caseTypes');
  }

  getCaseTypes({ authorization }: any): Observable<any> {
    return from(
      axios
        .get(encodeURI(environment.pega.basev1Url + environment.CASETYPES), {
          headers: { Authorization: authorization },
        })
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getCaseTypeActions(payload: any): Observable<any> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev1Url +
              environment.CASETYPES +
              `/${payload.caseTypeId}` +
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
}
