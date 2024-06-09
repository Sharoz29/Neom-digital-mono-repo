import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiParam, ApiBody, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { IotMqttCreateVm, IotMqttVm, PSIOT_MQTT } from '@neom/models';
import { IotMqttApiService } from './iot-mqtt-api.service';
import { ParseObjectPipe } from '@neom/nst-libs/lib/pipes/parseobject.pipe';

@Controller('iot-mqtt')
@ApiTags('IOT MQTT Endpoints')
// @CustomizeLogInterceptor({module: 'IotMqtt'})
export class IotMqttApiController {
  constructor(private readonly _iotMqttApiService: IotMqttApiService) {}

  /**
   * Publish a message to an MQTT topic.
   * @returns {Promise<string>} - A promise that resolves to a confirmation message.
   */
  @Post('publish')
  @ApiResponse({
    status: 200,
    type: String,
    description:
      'Successfully published the message to the specified MQTT topic.',
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
  publishMessage(
    @Body() body: IotMqttCreateVm
  ) {
    try {
      return this._iotMqttApiService.publishMQTT(body);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // /**
  //  * Publish a message from Cumulocity IoT to an MQTT topic.
  //  * @param {string} topic - The MQTT topic to publish to.
  //  * @param {string} message - The message payload to publish.
  //  * @returns {Promise<string>} - A promise that resolves to a confirmation message.
  //  */
  // @Post('publishFromCumulocity/:topic/:message')
  // @ApiResponse({
  //   status: 200,
  //   description:
  //     'Successfully published the message to the specified MQTT topic.',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description:
  //     'Bad Request: The request could not be understood or was missing required parameters.',
  // })
  // @ApiResponse({
  //   status: 502,
  //   description: 'Bad Gateway',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Not Found: The requested resource could not be found.',
  // })
  // @ApiOperation({
  //   summary: 'Publish message from Cumulocity IoT to MQTT device',
  // })
  // async publishMessageFromCumulocity(
  //   @Param('topic') topic: string,
  //   @Param('message') message: string
  // ): Promise<string> {
  //   try {
  //     return await this._iotMqttApiService.publishFromCumulocity(
  //       topic,
  //       message
  //     );
  //   } catch (error: any) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // /**
  //  * Retrieve the cached message for a specific MQTT topic.
  //  * @param {string} topic - The MQTT topic to retrieve the cached message for.
  //  * @returns {Promise<string>} - A promise that resolves to the cached message.
  //  */
  // @Get('cache/:topic')
  // @ApiResponse({
  //   status: 200,
  //   description:
  //     'Successfully retrieved the cached message for the specified topic.',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description:
  //     'Bad Request: The request could not be understood or was missing required parameters.',
  // })
  // @ApiResponse({
  //   status: 502,
  //   description: 'Bad Gateway',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Not Found: The requested resource could not be found.',
  // })
  // @ApiOperation({ summary: 'Get cached message for MQTT topic' })
  // async getCachedMessage(@Param('topic') topic: string): Promise<string> {
  //   try {
  //     return await this._iotMqttApiService.getCachedMessage(topic);
  //   } catch (error: any) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // /**
  //  * Subscribe to an MQTT topic.
  //  * @param {string} topic - The MQTT topic to subscribe to.
  //  * @returns {Promise<string>} - A promise that resolves to a confirmation message.
  //  */
  // @Get('subscribe/:topic')
  // @ApiResponse({
  //   status: 200,
  //   description: 'Successfully subscribed to the specified MQTT topic.',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description:
  //     'Bad Request: The request could not be understood or was missing required parameters.',
  // })
  // @ApiResponse({
  //   status: 502,
  //   description: 'Bad Gateway',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Not Found: The requested resource could not be found.',
  // })
  // @ApiOperation({ summary: 'Subscribe to an MQTT topic' })
  // async subscribeToTopic(@Param('topic') topic: string): Promise<string> {
  //   try {
  //     this._iotMqttApiService.subscribe(topic, (message) => {
  //       console.log(`Received message from ${topic}: ${message}`);
  //     });
  //     return `Subscribed to ${topic}`;
  //   } catch (error: any) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
// }
}
