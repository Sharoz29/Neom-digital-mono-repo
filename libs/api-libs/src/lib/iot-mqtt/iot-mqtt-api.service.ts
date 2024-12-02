import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { IoTQueues } from '@neom/shared';
import { BaseApiService } from '../services/baseapi.service';
import { CreateAlarmVm, IotMqttCreateVm, IotMqttVm, PSIOT_MQTT, UpdateAlarmVm } from '@neom/models';
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
   * @returns {Observable<any>} The response from the domain service.
   * @throws {HttpException} If an error occurs while publishing the message.
   */
  publishToMqttBroker(body: IotMqttCreateVm): Observable<any> {
    this.logger.log(`Publishing to ${body.pattern}`);

    return this.client.send(PSIOT_MQTT.PUBLISH, body).pipe(
      tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
      catchError((err) => {
        this.logger.error('Error publishing command to device topic' + err);
        throw new HttpException('Error While sending topic', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Subscribes to a specified MQTT topic.
   *
   * @param {string} topic - The MQTT topic to subscribe to.
   * @returns {Observable<any>} The response from the domain service.
   * @throws {HttpException} If an error occurs while subscribing to the topic.
   */
  subscribeToMqttBroker(topic: string): Observable<any> {
    this.logger.log(`Subscribing to ${topic}`);

    return this.client.send(PSIOT_MQTT.SUBSCRIBE, { topic }).pipe(
      tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
      catchError((err) => {
        this.logger.error('Error subscribing to device topic' + err);
        throw new HttpException('Error While sending topic', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Publishes a message from Cumulocity IoT to the MQTT broker.
   *
   * @param {IotMqttCreateVm} body - The message body to publish.
   * @returns {Observable<any>} The response from the domain service.
   * @throws {HttpException} If an error occurs while publishing the message.
   */
  publishMessageFromCumulocityIoT(body: IotMqttCreateVm): Observable<any> {
    this.logger.log(`Publishing to ${body.pattern}`);
    return this.client.send(PSIOT_MQTT.PUBLISHFROMCUMULOCITY, body).pipe(
      tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
      catchError((err) => {
        this.logger.error('Error While publishing command to the topic' + err);
        throw new HttpException('Error While publishing command', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Retrieves device details from Cumulocity IoT based on the given device ID.
   *
   * @param {string} deviceID - The unique identifier of the device in Cumulocity.
   * @returns {Observable<any>} The detailed information of the device.
   * @throws {HttpException} If an error occurs while retrieving the device details.
   */
  fetchDeviceDetailsFromCumulocity(deviceID: string): Observable<any> {
    this.logger.log(`Sending Device ID ${deviceID}`);
    return this.client.send(PSIOT_MQTT.DEVICEDETAILSFROMCUMULOCITY, { deviceID }).pipe(
      tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
      catchError((err) => {
        this.logger.error('Error While fetching device ID' + err);
        throw new HttpException('Error While fetching device ID', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Registers and subscribes a device to Cumulocity IoT based on the given topic.
   *
   * @param {string} topic - The MQTT topic to subscribe the device to.
   * @returns {Observable<any>} The response from the domain service.
   * @throws {HttpException} If an error occurs while registering or subscribing the device.
   */
  registerAndSubscribeDeviceToCumulocity(topic: string): Observable<any> {
    this.logger.log(`Sending Device topic as name ${topic}`);

    if (!topic) {
      throw new HttpException('Invalid Topic', HttpStatus.BAD_REQUEST);
    }

    return this.client.send(PSIOT_MQTT.REGISTERDEVICETOCUMULOCITY, { topic }).pipe(
      tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
      catchError((err) => {
        this.logger.error('Error While registering device to Cumulocity' + err);
        throw new HttpException('Error While sending device topic as name', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Creates an alarm for an IoT device.
   *
   * @param {CreateAlarmVm} body - Alarm creation request payload.
   * @returns {Observable<any>} The result of the alarm creation.
   * @throws {HttpException} If an error occurs during the alarm creation.
   */
  createAlarmForDevice(body: CreateAlarmVm): Observable<any> {
    this.logger.log(`Sending payload ${body.text} type ${body.type}`);
    return this.client.send(PSIOT_MQTT.CREATEALARM, body).pipe(
      tap((res) => this.logger.log(`Message sent to domain service: ${res}`)),
      catchError((err) => {
        this.logger.error('Error creating device alarm' + err);
        throw new HttpException('Error While creating alarm', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Retrieves all alarms from the IoT devices.
   *
   * @returns {Observable<any>} The alarms retrieved from the domain service.
   * @throws {HttpException} If an error occurs while fetching alarms.
   */
  getAlarms(): Observable<any> {
    return this.client.send(PSIOT_MQTT.GETALARMS, {}).pipe(
      tap((res) => this.logger.log(`Alarms Retrieved: ${JSON.stringify(res)}`)),
      catchError((err) => {
        this.logger.error('Error While getting alarms of devices' + err);
        throw new HttpException('Error While retrieving alarms', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Updates multiple alarms in the collection.
   *
   * @param {UpdateAlarmVm} payload - The payload to update alarm collections.
   * @returns {Observable<any>} The response from the domain service.
   * @throws {HttpException} If an error occurs while updating alarms.
   */
  updateAlarmCollection(payload: UpdateAlarmVm): Observable<any> {
    return this.client.send(PSIOT_MQTT.UPDATEALARMCOLLECTION, payload).pipe(
      tap((res) => this.logger.log(`Updated alarm collection: ${res}`)),
      catchError((err) => {
        this.logger.error('Error updating alarm collection', err);
        throw new HttpException('Failed to update alarms', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Removes multiple alarms based on query parameters.
   *
   * @param {any} query - Query parameters for removing alarms.
   * @returns {Observable<any>} The response from the domain service.
   * @throws {HttpException} If an error occurs while removing alarms.
   */
  removeAlarmCollection(query: any): Observable<any> {
    return this.client.send(PSIOT_MQTT.REMOVEALARMCOLLECTION, query).pipe(
      tap((res) => this.logger.log(`Removed alarm collection: ${res}`)),
      catchError((err) => {
        this.logger.error('Error removing alarm collection', err);
        throw new HttpException('Failed to remove alarms', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Retrieves a specific alarm by its ID.
   *
   * @param {string} alarmId - The ID of the alarm to retrieve.
   * @returns {Observable<any>} The alarm details.
   * @throws {HttpException} If an error occurs while retrieving the alarm.
   */
  getSpecificAlarm(alarmId: string): Observable<any> {
    return this.client.send(PSIOT_MQTT.GETSPECIFICALARM, { alarmId }).pipe(
      tap((res) => this.logger.log(`Retrieved specific alarm: ${res}`)),
      catchError((err) => {
        this.logger.error('Error retrieving specific alarm', err);
        throw new HttpException('Failed to retrieve alarm', HttpStatus.NOT_FOUND);
      })
    );
  }

  /**
   * Updates a specific alarm by its ID.
   *
   * @param {string} alarmId - The ID of the alarm.
   * @param {UpdateAlarmVm} body - The payload for the update.
   * @returns {Observable<any>} The response after updating the alarm.
   * @throws {HttpException} If an error occurs while updating the alarm.
   */
  updateSpecificAlarm(alarmId: string, body: UpdateAlarmVm): Observable<any> {
    this.logger.log(`Updating alarm with text: ${body.text} severity: ${body.severity}`);
    return this.client.send(PSIOT_MQTT.UPDATEALARM, { alarmId, body }).pipe(
      tap((res) => this.logger.log(`Updated specific alarm: ${res}`)),
      catchError((err) => {
        this.logger.error('Error updating specific alarm', err);
        throw new HttpException('Failed to update alarm', HttpStatus.BAD_GATEWAY);
      })
    );
  }

  /**
   * Retrieves the total number of alarms.
   *
   * @returns {Observable<any>} The total count of alarms.
   * @throws {HttpException} If an error occurs while retrieving the count.
   */
  getTotalAlarmCount(): Observable<any> {
    return this.client.send(PSIOT_MQTT.GETALARMCOUNT, {}).pipe(
      tap((res) => this.logger.log(`Total alarms count: ${res}`)),
      catchError((err) => {
        this.logger.error('Error retrieving alarm count', err);
        throw new HttpException('Failed to retrieve alarm count', HttpStatus.BAD_GATEWAY);
      })
    );
  }
}
