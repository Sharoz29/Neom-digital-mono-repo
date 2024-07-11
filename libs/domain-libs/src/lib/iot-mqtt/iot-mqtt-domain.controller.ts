import { Controller, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IotMqttDomainService } from './iot-mqtt-domain.service';
import { MessagePattern } from '@nestjs/microservices';
import { IotMqttDto, PSIOT_MQTT } from '@neom/models';
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
}
