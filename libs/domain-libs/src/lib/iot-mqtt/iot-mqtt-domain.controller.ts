import {
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiParam, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
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
  constructor(private readonly _iotMqttDomainService: IotMqttDomainService) {}

  /**
   * Publish a message to an MQTT topic.
   * @param {IotMqttDto} _iotMqttDto - The MQTT topic to publish to.
   * @returns {Promise<string>} - A promise that resolves to a confirmation message.
   */
  @MessagePattern(PSIOT_MQTT.PUBLISH)
  publishMQTT(_iotMqttDto: IotMqttDto): Promise<string> {
    return this._iotMqttDomainService.publish(_iotMqttDto);
  }
}
