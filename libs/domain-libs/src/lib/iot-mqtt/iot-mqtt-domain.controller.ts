import {
  Controller,
  Logger,
} from '@nestjs/common';
import {  ApiTags } from '@nestjs/swagger';
import { IotMqttDomainService } from './iot-mqtt-domain.service';
import { MessagePattern } from '@nestjs/microservices';
import { IotMqttDto, PSIOT_MQTT } from '@neom/models';

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
   * @returns {Promise<any>} The result of the publish operation.
   * @throws {Error} If an error occurs while processing the message.
   */
  @MessagePattern(PSIOT_MQTT.PUBLISH)
  async publishMQTT(iotMqttDto: IotMqttDto) {
    this.logger.log(`Received message: ${iotMqttDto.message}, pattern: ${iotMqttDto.pattern}`);
    try {
      const result = await this._iotMqttDomainService.publishTopicToMqttBroker(iotMqttDto);
      return result; // Ensure response is sent back correctly
    } catch (error: any) {
      this.logger.error(`Error processing message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handles messages with the PUBLISHFROMCUMULOCITY pattern.
   * Publishes a message from Cumulocity IoT to the MQTT broker.
   * 
   * @param {IotMqttDto} iotMqttDto - The message DTO containing the pattern and message.
   * @returns {Promise<any>} The result of the publish operation.
   * @throws {Error} If an error occurs while processing the message.
   */
  @MessagePattern(PSIOT_MQTT.PUBLISHFROMCUMULOCITY)
  async publishMQTTfromCumulocity(iotMqttDto: IotMqttDto) {
    this.logger.log(`Received message: ${iotMqttDto.message}, pattern: ${iotMqttDto.pattern}`);
    try {
      const result = await this._iotMqttDomainService.publishMessageFromCumulocityIoT(iotMqttDto);
      return result; // Ensure response is sent back correctly
    } catch (error: any) {
      this.logger.error(`Error processing message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handles messages with the SUBSCRIBE pattern.
   * Subscribes to a specified MQTT topic.
   * 
   * @param {Object} param - The subscription parameters.
   * @param {string} param.topic - The MQTT topic to subscribe to.
   * @returns {Promise<any>} The result of the subscription operation.
   * @throws {Error} If an error occurs while subscribing to the topic.
   */
  @MessagePattern(PSIOT_MQTT.SUBSCRIBE)
  async subscribeToMqttBroker({ topic }: { topic: string }) {
    this.logger.log(`Subscribing to topic: ${topic}`);
    try {
      const result = await this._iotMqttDomainService.subscribeToMqttBroker(topic);
      return result;
    } catch (error: any) {
      this.logger.error(`Error subscribing to topic: ${error.message}`);
      throw error;
    }
  }
}
