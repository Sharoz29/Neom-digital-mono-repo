import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { PSPAGE } from '@neom/models';
import { Observable } from 'rxjs';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class PageApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'page', cacheManagerRef);
  }

  getChannelById(channelId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSPAGE.GETCHANNELV2, {
        headers: req.headers,
        channelId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getDashboardById(dashboardId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSPAGE.GETDASHBOARDV2, {
        headers: req.headers,
        dashboardId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getInsightById(insightId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSPAGE.GETINSIGHTV2, {
        headers: req.headers,
        insightId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getPageById(pageId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSPAGE.GETONEV2, {
        headers: req.headers,
        pageId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
  getPortalById(portalId: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSPAGE.GETPORTALV2, {
        headers: req.headers,
        portalId,
      });
    } catch (error) {
      console.error('Error sending message to microservice:', error);
      throw error;
    }
  }
}
