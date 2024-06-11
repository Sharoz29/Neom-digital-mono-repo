import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../services/domain.service';
import {
  CaseTypeActionsVm,
  CaseTypeResponseVm,
  CaseTypeVm,
  CaseTypesVm,
} from '@neom/models';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';
import { Observable } from 'rxjs';

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

  async getCaseTypes({
    authorization,
  }: any): Promise<Observable<CaseTypeResponseVm>> {
    return await axios
      .get(environment.pega.baseUrl + environment.CASETYPES, {
        headers: { Authorization: authorization },
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return Promise.reject(error);
      });
  }
  async getCaseCreationPage({
    headers,
    params,
  }: any): Promise<Observable<CaseTypeVm>> {
    return await axios
      .get(environment.pega.baseUrl + environment.CASETYPES + `/${params}`, {
        headers: { Authorization: headers.authorization },
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return Promise.reject(error);
      });
  }
  async getCaseTypeActions(
    payload: any
  ): Promise<Observable<CaseTypeActionsVm>> {
    return await axios
      .get(
        encodeURI(
          environment.pega.baseUrl +
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
      .catch((error) => Promise.reject(error.message));
  }
}
