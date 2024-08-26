import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RMQQueues } from '@neom/shared';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { Injectable, Inject } from '@nestjs/common';
import { BaseDomainService } from '../../services/domain.service';
import { from } from 'rxjs';
import axios from 'axios';
import { environment } from '@neom/shared/lib/environments/dev';

// Extending from BaseDomainService to get Basic Functionality for CRUD
@Injectable()
export class CollaborationDomainService extends BaseDomainService<
  any,
  any,
  any
> {
  constructor(
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    super(_client, cacheManagerRef, 'collaboration');
  }

  getDocuments({ authorization }: any) {
    return from(
      axios
        .get(encodeURI(environment.pega.basev1Url + environment.DOCUMENTS), {
          headers: { Authorization: authorization },
        })
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getDocumentById({ headers, id }: any) {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev1Url + environment.DOCUMENTS + `/${id}`
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
  getMessages({ authorization }: any) {
    return from(
      axios
        .get(encodeURI(environment.pega.basev1Url + environment.MESSAGES), {
          headers: { Authorization: authorization },
        })
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getNotifications({ authorization }: any) {
    return from(
      axios
        .get(
          encodeURI(environment.pega.basev1Url + environment.NOTIFICATIONS),
          {
            headers: { Authorization: authorization },
          }
        )
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getSpaces({ authorization }: any) {
    return from(
      axios
        .get(encodeURI(environment.pega.basev1Url + environment.SPACES), {
          headers: { Authorization: authorization },
        })
        .then((response) => response.data)
        .catch((error) => {throw new RpcException(error)})
    );
  }
  getSpaceById({ headers, id }: any) {
    return from(
      axios
        .get(
          encodeURI(environment.pega.basev1Url + environment.SPACES + `/${id}`),
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
  getPinsOfSpace({ headers, id }: any) {
    return from(
      axios
        .get(
          encodeURI(
            environment.pega.basev1Url +
              environment.SPACES +
              `/${id}` +
              environment.PINS
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
}
