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
import { Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
  @ApiResponse({
    status: 200,
    description: 'Successfully published the message to the specified MQTT topic.',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 502, description: 'Bad Gateway' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiOperation({ summary: 'Publish message to IoT Device' })
  publishToMqtt(@Body() body: IotMqttCreateVm): Observable<{ message: string }> {
    return from(this._iotMqttApiService.publishToMqttBroker(body)).pipe(
      map(() => ({ message: 'Message successfully published to MQTT and sent to domain service' })),
      catchError((error: any) => {
        this.logger.error(`Error publishing message: ${error.message}`);
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }

  /**
   * Publishes a message from Cumulocity IoT to the specified MQTT topic.
   *
   * @param {IotMqttCreateVm} body - The message body to publish.
   * @returns {Observable<any>} An observable with a success message.
   * @throws {HttpException} If an error occurs while publishing.
   */
  @Post('publishFromCumulocity/:topic/:message')
  @ApiResponse({
    status: 200,
    description: 'Successfully published the message to the specified MQTT topic.',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 502, description: 'Bad Gateway' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiOperation({ summary: 'Publish message from Cumulocity IoT to MQTT device' })
  publishMessageFromCumulocityIoT(@Body() body: IotMqttCreateVm): Observable<any> {
    return from(this._iotMqttApiService.publishMessageFromCumulocityIoT(body)).pipe(
      catchError((error: any) => {
        this.logger.error(`Error publishing message: ${error.message}`);
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }

  /**
   * Retrieves device details from Cumulocity IoT based on the given device ID.
   *
   * @param {string} deviceID - The unique identifier of the device in Cumulocity.
   * @returns {Observable<any>} An observable with the detailed information of the device.
   * @throws {HttpException} If the device cannot be found or if an error occurs during the API call.
   */
  @Get('fetchDeviceDetailsFromCumulocity/:deviceID')
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved info of the Cumulocity IoT device',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 502, description: 'Bad Gateway' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiOperation({ summary: 'Get Device Details from Cumulocity IoT' })
  fetchDeviceDetailsFromCumulocity(@Param('deviceID') deviceID: string): Observable<any> {
    return from(this._iotMqttApiService.fetchDeviceDetailsFromCumulocity(deviceID)).pipe(
      catchError((error: any) => {
        this.logger.error(`Error fetching device details: ${error.message}`);
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }

  /**
   * Registers and subscribes a device to Cumulocity IoT based on the given topic.
   *
   * @param {string} topic - The MQTT topic to subscribe the device to.
   * @returns {Observable<any>} An observable with a success message.
   * @throws {HttpException} If an error occurs while registering or subscribing the device.
   */
  @Post('registerAndSubscribeDeviceToCumulocity/:topic/:message')
  @ApiResponse({
    status: 200,
    description: 'Successfully registered the device.',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 502, description: 'Bad Gateway' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiOperation({ summary: 'Register the device to Cumulocity' })
  registerAndSubscribeDeviceToCumulocity(@Param('topic') topic: string): Observable<any> {
    return from(this._iotMqttApiService.registerAndSubscribeDeviceToCumulocity(topic)).pipe(
      catchError((error: any) => {
        this.logger.error(`Error registering and subscribing device: ${error.message}`);
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      })
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
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 502, description: 'Bad Gateway' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiOperation({ summary: 'Subscribe to an MQTT topic' })
  subscribeToTopic(@Param('topic') topic: string): Observable<any> {
    return from(this._iotMqttApiService.subscribeToMqttBroker(topic)).pipe(
      catchError((error: any) => {
        this.logger.error(`Error subscribing to topic: ${error.message}`);
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }
}
