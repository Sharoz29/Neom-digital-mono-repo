import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import {
  CaseTypeActionsVm,
  CaseTypeResponseVm,
  CaseTypeVm,
  CaseTypesVm,
} from '@neom/models';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';
import { Observable, from } from 'rxjs';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class CaseTypesDomainService extends BaseDomainService<
  CaseTypesVm,
  CaseTypesVm,
  CaseTypesVm
> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'caseTypes');
  }

  getCaseTypes({ authorization }: any): Observable<CaseTypeResponseVm> {
    return from(
      axios
        .get(encodeURI(environment.pega.basev1Url + environment.CASETYPES), {
          headers: { Authorization: authorization },
        })
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getCaseTypeById({ headers, id }: any): Observable<CaseTypeVm> {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev1Url + environment.CASETYPES + `/${id}`
          ),
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
}
