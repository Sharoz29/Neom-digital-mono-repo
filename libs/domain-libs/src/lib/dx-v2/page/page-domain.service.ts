import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class PageDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'page');
  }

  getChannelById({ headers, channelId }: any): Observable<any> {
    return from(
      axios
        .get(
          environment.pega.basev2Url + environment.CHANNELS + `/${channelId}`,
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }
  getDashboardById({ headers, dashboardId }: any): Observable<any> {
    return from(
      axios
        .get(
          environment.pega.basev2Url +
            environment.DASHBOARD +
            `/${dashboardId}`,
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }
  getInsightById({ headers, insightId }: any): Observable<any> {
    return from(
      axios
        .get(
          environment.pega.basev2Url + environment.INSIGHT + `/${insightId}`,
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }
  getPageById({ headers, pageId }: any): Observable<any> {
    return from(
      axios
        .get(environment.pega.basev2Url + environment.PAGES + `/${pageId}`, {
          headers: { Authorization: headers.authorization },
        })
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }
  getPortalById({ headers, portalId }: any): Observable<any> {
    return from(
      axios
        .get(
          environment.pega.basev2Url + environment.PORTALS + `/${portalId}`,
          {
            headers: { Authorization: headers.authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }
}
