import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { IoTQueues } from '@neom/shared';
import { BaseApiService } from '../services/baseapi.service';
import {
  IotMqttCreateVm,
  IotMqttVm,
  PSIOT_MQTT,
} from '@neom/models';
import { lastValueFrom, Observable } from 'rxjs';

/**
 * Service for handling IoT MQTT operations.
 * Extends the BaseApiService to implement basic API functionalities for CRUD operations.
 */
@Injectable()
export class IotMqttApiService extends BaseApiService<IotMqttVm, IotMqttVm, IotMqttVm> {

  /**
   * Constructor to inject dependencies.
   * @param {Cache} cacheManagerRef - The cache manager instance.
   * @param {ClientProxy} _client - The client proxy instance for microservices communication.
   */
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(IoTQueues.IoT_WORKER_QUEUE) public _client: ClientProxy
  ) {
    super(_client, 'iotMqtt', cacheManagerRef);
  }

  /**
   * Publishes a message to the MQTT broker.
   * 
   * @param {IotMqttCreateVm} body - The message body to publish.
   * @returns {Promise<any>} The response from the domain service.
   * @throws {Error} If an error occurs while publishing the message.
   */
   publishToMqttBroker(body: IotMqttCreateVm): Observable<any> {
    this.logger.log(`Publishing to ${body.pattern}`);
    try {
      const response$ = this.client.send(PSIOT_MQTT.PUBLISH, body);
      this.logger.log(`Message sent to domain service: ${response$}`);
      return response$; // Ensure the response is returned
    } catch (error: any) {
      this.logger.error(`Failed to send message to domain service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Subscribes to a specified MQTT topic.
   * 
   * @param {string} topic - The MQTT topic to subscribe to.
   * @returns {Observable<any>} The response from the domain service.
   * @throws {Error} If an error occurs while subscribing to the topic.
   */
   subscribeToMqttBroker(topic: string): Observable<any> {
    this.logger.log(`Subscribing to ${topic}`);
    try {
      const response$ = this.client.send(PSIOT_MQTT.SUBSCRIBE, {topic});
      this.logger.log(`Message sent to domain service: ${response$}`);
      return response$; // Ensure the response is returned
    } catch (error: any) {
      this.logger.error(`Failed to send message to domain service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Publishes a message from Cumulocity IoT to the MQTT broker.
   * 
   * @param {IotMqttCreateVm} body - The message body to publish.
   * @returns {Observable<any>} The response from the domain service.
   * @throws {Error} If an error occurs while publishing the message.
   */
   publishMessageFromCumulocityIoT(body: IotMqttCreateVm): Observable<any> {
    this.logger.log(`Publishing to ${body.pattern}`);
    try {
      const response$ = this.client.send(PSIOT_MQTT.PUBLISHFROMCUMULOCITY, body);
      this.logger.log(`Message sent to domain service: ${response$ }`);
      return response$; // Ensure the response is returned
    } catch (error: any) {
      this.logger.error(`Failed to send message to domain service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves device details from Cumulocity IoT based on the given device ID.
   * 
   * @param {string} deviceID - The unique identifier of the device in Cumulocity.
   * @returns {Observable<any>} The detailed information of the device.
   * @throws {Error} If an error occurs while retrieving the device details.
   */
   fetchDeviceDetailsFromCumulocity(deviceID: string): Observable<any> {
    this.logger.log(`Sending Device ID ${deviceID}`);
    try {
      const response$ = this.client.send(PSIOT_MQTT.DEVICEDETAILSFROMCUMULOCITY, {deviceID});
      this.logger.log(`Message sent to domain service: ${response$}`);
      return response$; // Ensure the response is returned
    } catch (error: any) {
      this.logger.error(`Failed to send message to domain service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Registers and subscribes a device to Cumulocity IoT based on the given topic.
   * 
   * @param {string} topic - The MQTT topic to subscribe the device to.
   * @returns {Observable<any>} The response from the domain service.
   * @throws {Error} If an error occurs while registering or subscribing the device.
   */
   registerAndSubscribeDeviceToCumulocity(topic: string): Observable<any> {
    this.logger.log(`Sending Device topic as name ${topic}`);
    try {
      const response$ = this.client.send(PSIOT_MQTT.REGISTERDEVICETOCUMULOCITY, {topic});
      this.logger.log(`Message sent to domain service: ${response$}`);
      return response$; // Ensure the response is returned
    } catch (error: any) {
      this.logger.error(`Failed to send message to domain service: ${error.message}`);
      throw error;
    }
  }
}
