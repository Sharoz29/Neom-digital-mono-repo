import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { IotMqttCreateVm } from '@neom/models';
import { IotMqttApiService } from './iot-mqtt-api.service';

@Controller('iot-mqtt')
@ApiTags('IOT MQTT Endpoints')
export class IotMqttApiController {
  logger: any;

  constructor(private readonly _iotMqttApiService: IotMqttApiService) {}

  /**
   * Publishes a message to the specified MQTT topic.
   *
   * @param {IotMqttCreateVm} body - The message body to publish.
   * @returns {Observable<{message: string}>} An observable with a success message.
   * @throws {HttpException} If an error occurs while publishing.
   */
  @Post('publish-to-mqtt')
  @ApiOkResponse({
    description:
      'Successfully published the message to the specified MQTT topic.',
    type: String,
  })
  @ApiBadGatewayResponse({
    description:
      'Bad Gateway: Backend Service might be down or not responding at the moment.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiNotFoundResponse({ description: 'Content Not Found' })
  @ApiOperation({ summary: 'Publish message to IoT Device' })
  publishToMqtt(
    @Body() body: IotMqttCreateVm
  ): Observable<{ message: string }> {
    return this._iotMqttApiService.publishToMqttBroker(body);
  }

  /**
   * Publishes a message from Cumulocity IoT to the specified MQTT topic.
   *
   * @param {IotMqttCreateVm} body - The message body to publish.
   * @returns {Observable<any>} An observable with a success message.
   * @throws {HttpException} If an error occurs while publishing.
   */
  @Post('publishFromCumulocity/:topic/:message')
  @ApiOkResponse({
    description:
      'Successfully published the message to the specified MQTT topic.',
    type: String,
  })
  @ApiBadGatewayResponse({
    description:
      'Bad Gateway: Backend Service might be down or not responding at the moment.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiNotFoundResponse({ description: 'Content Not Found' })
  @ApiOperation({
    summary: 'Publish message from Cumulocity IoT to MQTT device',
  })
  publishMessageFromCumulocityIoT(
    @Body() body: IotMqttCreateVm
  ): Observable<any> {
    return this._iotMqttApiService.publishMessageFromCumulocityIoT(body);
  }

  /**
   * Retrieves device details from Cumulocity IoT based on the given device ID.
   *
   * @param {string} deviceID - The unique identifier of the device in Cumulocity.
   * @returns {Observable<any>} An observable with the detailed information of the device.
   * @throws {HttpException} If the device cannot be found or if an error occurs during the API call.
   */
  @Get('fetchDeviceDetailsFromCumulocity/:deviceID')
  @ApiOkResponse({
    description: 'Successfully retrieved info of the Cumulocity IoT device',
    type: String,
  })
  @ApiBadGatewayResponse({
    description:
      'Bad Gateway: Backend Service might be down or not responding at the moment.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiNotFoundResponse({ description: 'Content Not Found' })
  @ApiOperation({ summary: 'Get Device Details from Cumulocity IoT' })
  fetchDeviceDetailsFromCumulocity(
    @Param('deviceID') deviceID: string
  ): Observable<any> {
    return this._iotMqttApiService.fetchDeviceDetailsFromCumulocity(deviceID);
  }

  /**
   * Registers and subscribes a device to Cumulocity IoT based on the given topic.
   *
   * @param {string} topic - The MQTT topic to subscribe the device to.
   * @returns {Observable<any>} An observable with a success message.
   * @throws {HttpException} If an error occurs while registering or subscribing the device.
   */
  @Post('registerAndSubscribeDeviceToCumulocity/:topic/:message')
  @ApiOkResponse({
    description: 'Successfully registered the device.',
    type: String,
  })
  @ApiBadGatewayResponse({
    description:
      'Bad Gateway: Backend Service might be down or not responding at the moment.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiOperation({ summary: 'Register the device to Cumulocity' })
  registerAndSubscribeDeviceToCumulocity(
    @Param('topic') topic: string
  ): Observable<any> {
    return this._iotMqttApiService.registerAndSubscribeDeviceToCumulocity(
      topic
    );
  }

  /**
   * Subscribes to the specified MQTT topic.
   *
   * @param {string} topic - The MQTT topic to subscribe to.
   * @returns {Observable<any>} An observable with a success message.
   * @throws {HttpException} If an error occurs while subscribing.
   */
  @Get('subscribe-to-mqtt-topic/:topic')
  @ApiResponse({
    status: 200,
    description: 'Successfully subscribed to the specified MQTT topic.',
    type: String,
  })
  @ApiBadGatewayResponse({
    description:
      'Bad Gateway: Backend Service might be down or not responding at the moment.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiNotFoundResponse({ description: 'Content Not Found' })
  @ApiOperation({ summary: 'Subscribe to an MQTT topic' })
  subscribeToTopic(@Param('topic') topic: string): Observable<any> {
    return this._iotMqttApiService.subscribeToMqttBroker(topic);
  }
}
