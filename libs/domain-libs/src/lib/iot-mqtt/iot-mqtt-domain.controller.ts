import { Controller, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IotMqttDomainService } from './iot-mqtt-domain.service';
import { MessagePattern } from '@nestjs/microservices';
import {
  CreateAlarmDto,
  UpdateAlarmDto,
  IotMqttDto,
  PSIOT_MQTT,
} from '@neom/models';
import { Observable } from 'rxjs';

/**
 * Controller to handle HTTP requests for the IoT MQTT domain.
 * Provides endpoints for publishing messages, retrieving cached messages, and subscribing to topics.
 */
@Controller('iot-mqtt')
@ApiTags('iot-mqtt')
export class IotMqttDomainController {
  private readonly logger = new Logger(IotMqttDomainController.name);

  /**
   * Constructor to inject the IotMqttDomainService.
   * @param _iotMqttDomainService The service to handle domain-specific MQTT operations.
   */
  constructor(private readonly _iotMqttDomainService: IotMqttDomainService) {}

  /**
   * Handles messages with the PUBLISH pattern.
   * Publishes a message to the MQTT broker.
   *
   * @param {IotMqttDto} iotMqttDto - The message DTO containing the pattern and message.
   * @returns {Observable<any>} The result of the publish operation.
   * @throws {Error} If an error occurs while processing the message.
   */
  @MessagePattern(PSIOT_MQTT.PUBLISH)
  publishMQTT(iotMqttDto: IotMqttDto): Observable<any> {
    return this._iotMqttDomainService.publishTopicToMqttBroker(iotMqttDto);
  }

  /**
   * Handles messages with the PUBLISHFROMCUMULOCITY pattern.
   * Publishes a message from Cumulocity IoT to the MQTT broker.
   *
   * @param {IotMqttDto} iotMqttDto - The message DTO containing the pattern and message.
   * @returns {Observable<any>} The result of the publish operation.
   * @throws {Error} If an error occurs while processing the message.
   */
  @MessagePattern(PSIOT_MQTT.PUBLISHFROMCUMULOCITY)
  publishMQTTfromCumulocity(iotMqttDto: IotMqttDto): Observable<any> {
    return this._iotMqttDomainService.publishMessageFromCumulocityIoT(
      iotMqttDto
    );
  }

  /**
   * Handles messages with the SUBSCRIBE pattern.
   * Subscribes to a specified MQTT topic.
   *
   * @param {Object} param - The subscription parameters.
   * @param {string} param.topic - The MQTT topic to subscribe to.
   * @returns {Observable<any>} The result of the subscription operation.
   * @throws {Error} If an error occurs while subscribing to the topic.
   */
  @MessagePattern(PSIOT_MQTT.SUBSCRIBE)
  subscribeToMqttBroker({ topic }: { topic: string }): Observable<any> {
    return this._iotMqttDomainService.subscribeToMqttBroker(topic);
  }

  /**
   * Retrieves details for a device registered in Cumulocity based on the provided device ID.
   *
   * @param {Object} param - The parameters containing the device ID.
   * @param {string} param.deviceID - The unique identifier of the device in Cumulocity.
   * @returns {Observable<any>} The detailed information of the device from Cumulocity.
   * @throws {Error} If an error occurs during the API call or the device cannot be found.
   */
  @MessagePattern(PSIOT_MQTT.DEVICEDETAILSFROMCUMULOCITY)
  fetchDeviceDetailsFromCumulocity({
    deviceID,
  }: {
    deviceID: string;
  }): Observable<any> {
    return this._iotMqttDomainService.fetchDeviceDetailsFromCumulocity(
      deviceID
    );
  }

  /**
   * Handles messages with the REGISTERDEVICETOCUMULOCITY pattern.
   * Registers and subscribes a device to Cumulocity IoT based on the given topic.
   *
   * @param {Object} param - The parameters containing the topic.
   * @param {string} param.topic - The MQTT topic to subscribe the device to.
   * @returns {Observable<any>} The result of the registration and subscription operation.
   * @throws {Error} If an error occurs while registering or subscribing the device.
   */
  @MessagePattern(PSIOT_MQTT.REGISTERDEVICETOCUMULOCITY)
  registerAndSubscribeDeviceToCumulocity({
    topic,
  }: {
    topic: string;
  }): Observable<any> {
    return this._iotMqttDomainService.registerAndSubscribeDevices(topic);
  }

  @MessagePattern(PSIOT_MQTT.CREATEALARM)
  createAlarm(createAlarmDto: CreateAlarmDto): Observable<any> {
    return this._iotMqttDomainService.createAlarmForDevice(createAlarmDto);
  }

  @MessagePattern(PSIOT_MQTT.GETALARMS)
  getAlarms({}: { alarm: string }): Observable<any> {
    return this._iotMqttDomainService.getAlarms();
  }

  /**
   * Update alarm collections based on query parameters.
   *
   * @param {Partial<UpdateAlarmDto>} updateAlarmDto - DTO containing update parameters.
   * @returns {Observable<any>} The result of the update operation.
   */
  @MessagePattern(PSIOT_MQTT.UPDATEALARMCOLLECTION)
  updateAlarmCollection(
    updateAlarmDto: Partial<UpdateAlarmDto>
  ): Observable<any> {
    this.logger.log(
      `Updating alarm collection with data: ${JSON.stringify(updateAlarmDto)}`
    );
    return this._iotMqttDomainService.updateAlarmCollection(updateAlarmDto);
  }

  /**
   * Remove alarm collections based on query parameters.
   *
   * @param {any} query - Query parameters for removing alarms.
   * @returns {Observable<any>} The result of the removal operation.
   */
  @MessagePattern(PSIOT_MQTT.REMOVEALARMCOLLECTION)
  removeAlarmCollection(query: any): Observable<any> {
    this.logger.log(
      `Removing alarm collection with query: ${JSON.stringify(query)}`
    );
    return this._iotMqttDomainService.removeAlarmCollection(query);
  }

  /**
   * Retrieve a specific alarm by ID.
   *
   * @param {string} alarmId - The ID of the alarm to retrieve.
   * @returns {Observable<any>} The details of the specific alarm.
   */
  @MessagePattern(PSIOT_MQTT.GETSPECIFICALARM)
  getSpecificAlarm({ alarmId }: { alarmId: string }): Observable<any> {
    this.logger.log(`Fetching alarm with ID: ${alarmId}`);
    return this._iotMqttDomainService.getSpecificAlarm(alarmId);
  }

  /**
   * Update a specific alarm by ID.
   *
   * @param {UpdateAlarmDto} data - The alarm ID and update payload.
   * @returns {Observable<any>} The result of the update operation.
   */
  @MessagePattern(PSIOT_MQTT.UPDATEALARM)
  updateSpecificAlarm( data: {
    alarmId: string;
    body: UpdateAlarmDto;
  }): Observable<any> {
    this.logger.log(
      `Updating specific alarm with ID: ${data.alarmId} and payload: ${data.body}`
    );
    this.logger.log(
      `Received updateSpecificAlarm call: ${JSON.stringify(data)}`
    );
    this.logger.log(`Alarm ID: ${data.alarmId}`);
    this.logger.log(`Body: ${JSON.stringify(data.body)}`);

    return this._iotMqttDomainService.updateSpecificAlarm(
      data.alarmId,
      data.body
    );
  }

  /**
   * Retrieve the total count of alarms.
   *
   * @returns {Observable<any>} The total number of alarms.
   */
  @MessagePattern(PSIOT_MQTT.GETALARMCOUNT)
  getTotalAlarms(): Observable<any> {
    this.logger.log(`Fetching total number of alarms`);
    return this._iotMqttDomainService.getTotalAlarmCount();
  }
}
