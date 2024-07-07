import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

import { IotMqttCreateVm } from '@neom/models';
import { IotMqttApiService } from './iot-mqtt-api.service';

/**
 * Controller for handling IoT MQTT API endpoints.
 */
@Controller('iot-mqtt')
@ApiTags('IOT MQTT Endpoints')
export class IotMqttApiController {
  logger: any;

  /**
   * Constructor to inject the IotMqttApiService.
   * @param _iotMqttApiService The service to handle MQTT operations.
   */
  constructor(private readonly _iotMqttApiService: IotMqttApiService) {}

  /**
   * Publishes a message to the specified MQTT topic.
   *
   * @param {IotMqttCreateVm} body - The message body to publish.
   * @returns {Promise<{message: string}>} A success message.
   * @throws {HttpException} If an error occurs while publishing.
   */
  @Post('publish-to-mqtt')
  @ApiResponse({
    status: 200,
    description:
      'Successfully published the message to the specified MQTT topic.',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: The requested resource could not be found.',
  })
  @ApiOperation({ summary: 'Publish message to IoT Device' })
  async publishToMqtt(@Body() body: IotMqttCreateVm) {
    try {
      await this._iotMqttApiService.publishToMqttBroker(body);
      return {
        message:
          'Message successfully published to MQTT and sent to domain service',
      };
    } catch (error: any) {
      this.logger.error(`Error publishing message: ${error.message}`);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Publishes a message from Cumulocity IoT to the specified MQTT topic.
   *
   * @param {IotMqttCreateVm} body - The message body to publish.
   * @returns {Promise<any>} A success message.
   * @throws {HttpException} If an error occurs while publishing.
   */
  @Post('publishFromCumulocity/:topic/:message')
  @ApiResponse({
    status: 200,
    description:
      'Successfully published the message to the specified MQTT topic.',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: The requested resource could not be found.',
  })
  @ApiOperation({
    summary: 'Publish message from Cumulocity IoT to MQTT device',
  })
  async publishMessageFromCumulocityIoT(@Body() body: IotMqttCreateVm) {
    return await this._iotMqttApiService.publishMessageFromCumulocityIoT(body);
  }

  /**
   * Retrieves device details from Cumulocity IoT based on the given device ID.
   *
   * @param {string} deviceID - The unique identifier of the device in Cumulocity.
   * @returns {Promise<any>} The detailed information of the device.
   * @throws {HttpException} If the device cannot be found or if an error occurs during the API call.
   */
  @Get('fetchDeviceDetailsFromCumulocity/:deviceID')
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved info of the Cumulocity IoT device',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: The requested resource could not be found.',
  })
  @ApiOperation({
    summary: 'Get Device Details from Cumulocity IoT',
  })
  async fetchDeviceDetailsFromCumulocity(@Param('deviceID') deviceID: string) {
    return await this._iotMqttApiService.fetchDeviceDetailsFromCumulocity(
      deviceID
    );
  }

  /**
   * Registers and subscribes a device to Cumulocity IoT based on the given topic.
   *
   * @param {string} topic - The MQTT topic to subscribe the device to.
   * @returns {Promise<any>} A success message.
   * @throws {HttpException} If an error occurs while registering or subscribing the device.
   */
  @Post('registerAndSubscribeDeviceToCumulocity/:topic/:message')
  @ApiResponse({
    status: 200,
    description: 'Successfully registered the device.',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: The requested resource could not be found.',
  })
  @ApiOperation({
    summary: 'Register the device to Cumulocity',
  })
  async registerAndSubscribeDeviceToCumulocity(@Param('topic') topic: string) {
    return await this._iotMqttApiService.registerAndSubscribeDeviceToCumulocity(
      topic
    );
  }

  /**
   * Subscribes to the specified MQTT topic.
   *
   * @param {string} topic - The MQTT topic to subscribe to.
   * @returns {Promise<any>} A success message.
   * @throws {HttpException} If an error occurs while subscribing.
   */
  @Get('subscribe-to-mqtt-topic/:topic')
  @ApiResponse({
    status: 200,
    description: 'Successfully subscribed to the specified MQTT topic.',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: The requested resource could not be found.',
  })
  @ApiOperation({ summary: 'Subscribe to an MQTT topic' })
  async subscribeToTopic(@Param('topic') topic: string) {
    return await this._iotMqttApiService.subscribeToMqttBroker(topic);
  }
}
