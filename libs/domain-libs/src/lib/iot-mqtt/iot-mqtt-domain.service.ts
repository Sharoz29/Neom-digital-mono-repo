import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { IoTQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';
import { environment } from '@neom/shared/lib/environments/dev';
import { connect } from 'mqtt';
import { Injectable, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { BaseDomainService } from '../services/domain.service';

import { IotMqttCreateVm, IotMqttVm } from '@neom/models';

/**
 * Service to handle MQTT domain operations for IoT.
 * Extends the BaseDomainService to implement domain-specific functionalities.
 */
@Injectable()
export class IotMqttDomainService extends BaseDomainService<IotMqttVm, IotMqttVm, IotMqttVm> {
  override readonly logger = new Logger(IotMqttDomainService.name);
  private mqttClient: any;
  private cumulocityClient: any;
  private mqttConnected = false;

  /**
   * Constructor to inject dependencies.
   * @param {ClientProxy} _client - The client proxy instance for microservices communication.
   * @param {Cache} cacheManagerRef - The cache manager instance.
   */
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(IoTQueues.IoT_WORKER_QUEUE) _client: ClientProxy,
  ) {
    super(_client, cacheManagerRef, 'iot-mqtt');
    this.initMqttClient();
    this.initCumulocityClient();
  }

  /**
   * Initializes the MQTT client.
   */
  private initMqttClient() {
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
    const connectUrl = `mqtt://${environment.mqtt.host}:${environment.mqtt.port}`;
    this.logger.log(`Connecting to MQTT broker at ${connectUrl}`);
    
    this.mqttClient = connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    this.mqttClient.on('connect', () => {
      this.mqttConnected = true;
      this.logger.log('Connected to MQTT broker');
    });

    this.mqttClient.on('error', (error: any) => {
      this.logger.error('MQTT Connection Error', error);
      this.mqttConnected = false;
    });

    this.mqttClient.on('close', () => {
      this.mqttConnected = false;
      this.logger.log('MQTT Connection closed');
    });
  }

  /**
   * Initializes the Cumulocity client.
   */
  private initCumulocityClient() {
    const clientId = `c8y_${Math.random().toString(16).slice(3)}`;
    const cumulocityUrl = environment.cumulocity.url;

    this.logger.log(`Connecting to Cumulocity IoT at ${cumulocityUrl}`);

    this.cumulocityClient = connect(cumulocityUrl, {
      username: `${environment.cumulocity.tenantid}/${environment.cumulocity.username}`,
      password: environment.cumulocity.password,
      clientId,
    });

    this.cumulocityClient.on('connect', () => {
      this.logger.log('Connected to Cumulocity IoT');
    });

    this.cumulocityClient.on('error', (error: any) => {
      this.logger.error('Cumulocity IoT Connection Error', error);
    });

    this.cumulocityClient.on('close', () => {
      this.logger.log('Cumulocity IoT Connection closed');
    });
  }
  
  /**
   * Disconnects the MQTT and Cumulocity clients when the service is destroyed.
   */
  onModuleDestroy() {
    if (this.mqttClient) {
      this.mqttClient.end();
    }
    if (this.cumulocityClient) {
      this.cumulocityClient.end();
    }
  }

  /**
   * Publishes a message to the MQTT broker.
   * 
   * @param {IotMqttCreateVm} param0 - The message DTO containing the pattern and message.
   * @returns {Promise<any>} The result of the publish operation.
   * @throws {HttpException} If the MQTT client is not connected or if an error occurs while publishing the message.
   */
  async publishTopicToMqttBroker({ pattern, message }: IotMqttCreateVm) {
    if (!this.mqttConnected) {
      throw new HttpException('MQTT client not connected', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    this.logger.log(`Publishing to MQTT topic: ${pattern} with message: ${message}`);
    
    return new Promise((resolve, reject) => {
      this.mqttClient.publish(pattern, message, (error: any) => {
        if (error) {
          this.logger.error('Failed to publish message to MQTT broker', error);
          reject(new HttpException('Failed to publish message', HttpStatus.INTERNAL_SERVER_ERROR));
        } else {
          this.logger.log('Message published to MQTT broker');
          resolve({ status: 'success', message: 'Message published to MQTT broker' });
        }
      });
    });
  }

  /**
   * Publishes a message from Cumulocity IoT to the MQTT broker.
   * 
   * @param {IotMqttCreateVm} body - The message DTO containing the pattern and message.
   * @returns {Promise<string>} The result of the publish operation.
   */
  async publishMessageFromCumulocityIoT(body: IotMqttCreateVm) {
    this.logger.log(`Publishing to ${body.pattern} payload ${body.message}`);
    this.cumulocityClient.on('message', (topic: string, message: Buffer) => {
      this.logger.log(`Topic ${topic} message ${message.toString()}`);
      this.logger.log(`Command from Cumulocity: ${message.toString()}`);
      if (topic === 's/ds') {
        const command = message.toString().split(',');
        if (command[0] === '518') {
          const powerState = command[2] === 'CLOSED' ? '1' : '0';
          this.mqttClient.publish(`cmnd/${topic}/POWER`, powerState);
          return `Publishing to device ${topic} ${message.toString()}`;
        }
      }
      if (message.toString().startsWith('510')) {
        this.logger.log('Simulating device restart...');
        this.cumulocityClient.publish('s/us', '501,c8y_Restart');
        setTimeout(() => {
          this.cumulocityClient.publish('s/us', '503,c8y_Restart');
          this.logger.log('Restart command executed.');
        }, 1000);
        return `Publishing to devices`;
      }
      return `Topic: ${body.pattern}, message: ${body.message}`;
    });

    process.on('SIGINT', () => {
      this.mqttClient.end();
      this.cumulocityClient.end();
      this.logger.log('Disconnecting clients on shutdown');
      process.exit();
    });
    return `Publishing to ${body.pattern} ${body.message}`;
  }

  /**
   * Subscribes to a specified MQTT topic.
   * 
   * @param {string} topic - The MQTT topic to subscribe to.
   * @returns {Promise<any>} The result of the subscription operation.
   * @throws {HttpException} If the MQTT client is not connected or if an error occurs while subscribing to the topic.
   */
  async subscribeToMqttBroker(topic: string) {
    if (!this.mqttConnected) {
      throw new HttpException('MQTT client not connected', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`Subscribing to MQTT topic: ${topic}`);

    return new Promise((resolve, reject) => {
      this.mqttClient.subscribe(topic, (err: any) => {
        if (err) {
          this.logger.error(`Failed to subscribe to topic ${topic}`, err);
          reject(new HttpException('Failed to subscribe to topic', HttpStatus.INTERNAL_SERVER_ERROR));
        } else {
          this.logger.log(`Subscribed to topic ${topic}`);
          resolve({ status: 'success', message: `Subscribed to topic ${topic}` });
        }
      });

      this.mqttClient.on('message', (receivedTopic: string, message: Buffer) => {
        if (receivedTopic === topic || topic === '#') {
          const deviceName = receivedTopic.split('/');
          this.logger.log('device', receivedTopic, 'payload', message.toString());
          this.cumulocityClient.publish(
            's/us',
            `100,${deviceName[1]},c8y_MQTTDevice`,
            () => {
              this.logger.log('Device registered at Cumulocity');
            }
          );
          this.cumulocityClient.subscribe('s/ds');

          const parsedPayload = JSON.parse(message.toString());
          this.logger.debug('Payload', parsedPayload);
          const energyValues = parsedPayload.ENERGY;
          this.logger.debug('Energy values', energyValues);

          const timestamp = new Date().toISOString();
          const measurementMessage =
            `201,EnergyMeasurement,${timestamp},` +
            `c8y_EnergyMeasurement,Power,${energyValues.Power},W,` +
            `c8y_EnergyMeasurement,Voltage,${energyValues.Voltage},V,` +
            `c8y_EnergyMeasurement,Energy_Yesterday,${energyValues.Yesterday},kWh,` +
            `c8y_EnergyMeasurement,Energy_Today,${energyValues.Today},kWh,` +
            `c8y_EnergyMeasurement,Current,${energyValues.Current},A`;

          this.logger.log(
            `Sending measurements: Power - ${energyValues.Power} W, Voltage - ${energyValues.Voltage} V, Current - ${energyValues.Current} A, Energy_Yesterday - ${energyValues.Yesterday} kWh, Energy_Today - ${energyValues.Today} kWh`
          );
          this.cumulocityClient?.publish('s/us', measurementMessage);
        }
      });
    });
  }
}