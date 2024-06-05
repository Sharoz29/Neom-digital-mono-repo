import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../services/domain.service';
import { CaseVm } from '@neom/models';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class CaseDomainService extends BaseDomainService<
  CaseVm,
  CaseVm,
  CaseVm
> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'case');
  }

  async getCases({ authorization }: any) {
    return axios
      .get(environment.pega.baseUrl + environment.CASES, {
        headers: { Authorization: authorization },
      })
      .then((response) => response.data)
      .catch((error) => Promise.reject(error));
  }
  async getCaseById({ headers, params }: any) {
    return axios
      .get(environment.pega.baseUrl + environment.CASES + `/${params}`, {
        headers: { Authorization: headers.authorization },
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return Promise.reject(error);
      });
  }
  async getCaseAttachments({ headers, params }: any) {
    return axios
      .get(
        environment.pega.baseUrl + environment.CASES + `/${params}/attachments`,
        {
          headers: { Authorization: headers.authorization },
        }
      )
      .then((response) => response.data)
      .catch((error) => Promise.reject(error));
  }
  async getFieldsForCase(payload: any) {
    return axios
      .get(
        encodeURI(
          environment.pega.baseUrl +
            environment.CASES +
            `/${payload.caseInfoId}` +
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
  async getCasePage(payload: any) {
    return axios
      .get(
        encodeURI(
          environment.pega.baseUrl +
            environment.CASES +
            `/${payload.caseInfoId}` +
            environment.PAGES +
            `/${payload.pageId}`
        ),
        {
          headers: { Authorization: payload.headers.authorization },
        }
      )
      .then((response) => response.data)
      .catch((error) => Promise.reject(error));
  }
  async getCaseView(payload: any) {
    return axios
      .get(
        encodeURI(
          environment.pega.baseUrl +
            environment.CASES +
            `/${payload.caseInfoId}` +
            environment.VIEWS +
            `/${payload.viewId}`
        ),
        {
          headers: { Authorization: payload.headers.authorization },
        }
      )
      .then((response) => response.data)
      .catch((error) => Promise.reject(error));
  }
}
