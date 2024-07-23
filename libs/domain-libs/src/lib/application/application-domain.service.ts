import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../services/domain.service';
import { from, Observable } from 'rxjs';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';
import { error } from 'console';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class ApplicationDomainService extends BaseDomainService<any, any, any> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'application');
  }

  getApplications({ headers }: any): Observable<any> {
    return from(
      axios
        .get(environment.pega.basev1Url + environment.APPLICATIONS, {
          headers: { Authorization: headers.authorization },
        })
        .then((response) => response.data)
        .catch((error) => Promise.reject(error))
    );
  }

  getApplicationVersion({ headers }: any) {
    return from(
      axios
        .get(environment.pega.basev1Url + environment.APPLICATIONS, {
          headers: { Authorization: headers.authorization },
        })
        .then(async (res) => {
          const [app] = res?.data?.applications?.filter(
            (application: any) => application.name === headers.appname
          );
          if (!app) {
            throw new Error('Application not found');
          }
          return await axios
            .get(
              encodeURI(
                environment.pega.apiUrl +
                  environment.DATA +
                  environment.DATAPAGES
              ),
              {
                headers: { Authorization: headers.authorization },
                params: {
                  AppName: `${app.name}`,
                  AppVersion: `${app.version}`,
                },
              }
            )
            .then((res: any) => res.data)
            .catch((error: any) => Promise.reject(error));
        })
        .catch((error: any) => Promise.reject(error))
    );
  }
}
