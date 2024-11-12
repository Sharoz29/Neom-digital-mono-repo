import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
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

import { CreateAlarmVm, IotMqttCreateVm, UpdateAlarmVm } from '@neom/models';
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

  /**
   * Creates an alarm for an IoT device.
   *
   * @param {CreateAlarmVm} body - Alarm creation request payload.
   * @returns {Observable<any>} An observable with the alarm creation result.
   * @throws {HttpException} If an error occurs during the alarm creation.
   */
  @Post('alarm')
  @ApiOkResponse({
    description: 'Successfully created the alarm for the IoT device.',
    type: Object,
  })
  @ApiOperation({ summary: 'Create an alarm for an IoT Device' })
  createAlarm(@Body() body: CreateAlarmVm): Observable<any> {
    return this._iotMqttApiService.createAlarmForDevice(body);
  }

  /**
   * Retrieves alarms for all IoT devices.
   *
   * @returns {Observable<any>} An observable containing the alarms data.
   */
  @Get('alarm')
  @ApiOkResponse({
    description: 'Successfully retrieved the alarms of all IoT devices.',
    type: String,
  })
  @ApiOperation({ summary: 'Retrieve alarms for all IoT Devices' })
  getAllAlarms(): Observable<any> {
    return this._iotMqttApiService.getAlarms();
  }

  /**
   * Updates multiple alarm collections.
   *
   * @param {UpdateAlarmVm} body - Alarm update payload.
   * @returns {Observable<any>} The result of the update operation.
   */
  @Put('alarm-collections')
  @ApiOkResponse({
    description: 'Successfully updated the alarm collection.',
    type: Object,
  })
  @ApiOperation({ summary: 'Update alarm collections' })
  updateAlarmCollections(@Body() body: UpdateAlarmVm): Observable<any> {
    return this._iotMqttApiService.updateAlarmCollection(body);
  }

  /**
   * Deletes alarm collections based on a query.
   *
   * @param {any} query - The query parameters for deletion.
   * @returns {Observable<any>} The result of the delete operation.
   */
  @Delete('alarm-collections')
  @ApiOkResponse({
    description: 'Successfully deleted the alarm collection.',
    type: String,
  })
  @ApiOperation({ summary: 'Delete alarm collections' })
  removeAlarmCollections(@Body() query: any): Observable<any> {
    return this._iotMqttApiService.removeAlarmCollection(query);
  }

  /**
   * Retrieves a specific alarm by ID.
   *
   * @param {string} alarmId - The ID of the alarm to retrieve.
   * @returns {Observable<any>} The alarm details.
   */
  @Get('alarm/:alarmId')
  @ApiOkResponse({
    description: 'Successfully retrieved specific alarm details.',
    type: Object,
  })
  @ApiOperation({ summary: 'Retrieve a specific alarm by ID' })
  getAlarmById(@Param('alarmId') alarmId: string): Observable<any> {
    return this._iotMqttApiService.getSpecificAlarm(alarmId);
  }

  /**
   * Updates a specific alarm by ID.
   *
   * @param {string} alarmId - The ID of the alarm.
   * @param {UpdateAlarmVm} body - The update payload.
   * @returns {Observable<any>} The result of the update operation.
   */
  @Put('alarm/:alarmId')
  @ApiOkResponse({
    description: 'Successfully updated a specific alarm.',
    type: Object,
  })
  @ApiOperation({ summary: 'Update a specific alarm by ID' })
  updateAlarmById(
    @Param('alarmId') alarmId: string,
    @Body() body: UpdateAlarmVm
  ): Observable<any> {
    return this._iotMqttApiService.updateSpecificAlarm(alarmId, body);
  }

  /**
   * Retrieves the total count of alarms.
   *
   * @returns {Observable<any>} The total number of alarms.
   */
  @Get('alarm/count')
  @ApiOkResponse({
    description: 'Successfully retrieved the total number of alarms.',
    type: Object,
  })
  @ApiOperation({ summary: 'Retrieve total number of alarms' })
  getTotalAlarms(): Observable<any> {
    return this._iotMqttApiService.getTotalAlarmCount();
  }
}
