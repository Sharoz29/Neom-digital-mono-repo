import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../services/baseapi.service';
import { IotMqttCreateVm, IotMqttDto, IotMqttVm, PSIOT_MQTT } from '@neom/models';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class IotMqttApiService extends BaseApiService<any,any,any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE)public _client: ClientProxy
  ) {
    super(_client, 'iotMqtt', cacheManagerRef);
  }

  /**
   * Specialized Methods Come below:
   */

  publishMQTT(body: IotMqttCreateVm) {
    return this._client.send(PSIOT_MQTT.PUBLISH, new IotMqttDto({...body}))
  }

}
