import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../services/baseapi.service';
import { CaseVm, PSCASE } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class CaseApiService extends BaseApiService<CaseVm, CaseVm, CaseVm> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'case', cacheManagerRef);
  }
  async getCases(req: Request) {
    try {
      return this.client.send(PSCASE.GET, {
        headers: req.headers,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  async getCaseById(params: string, req: Request) {
    try {
      return this.client.send(PSCASE.GETONE, {
        headers: req.headers,
        params,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  async getCaseAttachments(params: string, req: Request) {
    try {
      return this.client.send(PSCASE.GETATTACHMENTS, {
        headers: req.headers,
        params,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  async getFieldsForCase(caseInfoId: string, actionId: string, req: Request) {
    try {
      return this.client.send(PSCASE.GETFIELDS, {
        headers: req.headers,
        caseInfoId,
        actionId,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  async getCasePage(caseInfoId: string, pageId: string, req: Request) {
    try {
      return this.client.send(PSCASE.GETPAGE, {
        headers: req.headers,
        caseInfoId,
        pageId,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  async getCaseView(caseInfoId: string, viewId: string, req: Request) {
    try {
      return this.client.send(PSCASE.GETVIEW, {
        headers: req.headers,
        caseInfoId,
        viewId,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
}
