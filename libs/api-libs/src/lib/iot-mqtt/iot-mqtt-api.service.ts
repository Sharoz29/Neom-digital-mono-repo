import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { IoTQueues } from '@neom/shared';
import { BaseApiService } from '../services/baseapi.service';
import { IotMqttCreateVm, IotMqttVm, PSIOT_MQTT } from '@neom/models';
import { catchError, Observable, tap } from 'rxjs';

/**
 * Service for handling IoT MQTT operations.
 * Extends the BaseApiService to implement basic API functionalities for CRUD operations.
 */
@Injectable()
export class IotMqttApiService extends BaseApiService<
  IotMqttVm,
  IotMqttVm,
  IotMqttVm
> {
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

    return this.client.send(PSIOT_MQTT.PUBLISH, body).pipe(
      tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
      catchError((err, obs) => {
        this.logger.error('Error publishing command to  device topic' + err);
        throw new HttpException(
          'Error While sending topic',
          HttpStatus.BAD_GATEWAY
        );
      })
    );
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

    return this.client.send(PSIOT_MQTT.SUBSCRIBE, { topic }).pipe(
      tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
      catchError((err, obs) => {
        this.logger.error('Error subscribing to  device topic' + err);
        throw new HttpException(
          'Error While sending topic',
          HttpStatus.BAD_GATEWAY
        );
      })
    );
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
    return this.client.send(PSIOT_MQTT.PUBLISHFROMCUMULOCITY, body).pipe(
      tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
      catchError((err, obs) => {
        this.logger.error('Error While publishing command to the topic' + err);
        throw new HttpException(
          'Error While publishing command',
          HttpStatus.BAD_GATEWAY
        );
      })
    );
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
    return this.client
      .send(PSIOT_MQTT.DEVICEDETAILSFROMCUMULOCITY, { deviceID })
      .pipe(
        tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
        catchError((err, obs) => {
          this.logger.error('Error While fetching device id' + err);
          throw new HttpException(
            'Error While fetching device id',
            HttpStatus.BAD_GATEWAY
          );
        })
      );
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

    if (!topic) {
      throw new HttpException('Invalid Topic', HttpStatus.BAD_REQUEST);
    }

    return this.client
      .send(PSIOT_MQTT.REGISTERDEVICETOCUMULOCITY, { topic })
      .pipe(
        tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
        catchError((err, obs) => {
          this.logger.error('Error While sending device topic as name' + err);
          throw new HttpException(
            'Error While sending device topic as name',
            HttpStatus.BAD_GATEWAY
          );
        })
      );
  }
}
