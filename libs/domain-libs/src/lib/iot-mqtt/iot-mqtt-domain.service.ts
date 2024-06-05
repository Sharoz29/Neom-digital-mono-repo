import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { environment } from '@neom/shared/lib/environments/dev';
import { connect } from 'mqtt';
import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';

/**
 * Service to handle MQTT communication and interaction with Cumulocity IoT platform.
 * Implements OnModuleInit to establish connections on module initialization.
 */
@Injectable()
export class IotMqttDomainService implements OnModuleInit {
  private mqttClient: any;
  private cumulocityClient: any;
  private deviceName: any;
  private logger = new Logger(IotMqttDomainService.name);
  private mqttConnected = false;  // Flag to track MQTT connection state

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Initialize connections to MQTT broker and Cumulocity IoT platform.
   * This method is called automatically when the module is initialized.
   */
  onModuleInit() {
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
    const cumulocityUrl = environment.cumulocity.url;

    // Connection to Cumulocity IoT
    this.cumulocityClient = connect(cumulocityUrl, {
      username: `${environment.cumulocity.tenantid}/${environment.cumulocity.username}`,
      password: environment.cumulocity.password,
      clientId: clientId,
    });

    this.cumulocityClient.on('connect', () => {
      this.logger.log('Connected to Cumulocity IoT');
      this.cumulocityClient.publish(
        's/us',
        `100,${this.deviceName},c8y_MQTTDevice`,
        () => {
          this.logger.log('Device registered at Cumulocity');
        }
      );
      this.cumulocityClient.subscribe('s/ds');
    });

    // Connection to MQTT broker
    const connectUrl = `mqtt://${environment.mqtt.host}:${environment.mqtt.port}`;
    this.mqttClient = connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    this.mqttClient.on('connect', () => {
      this.mqttConnected = true;  // Set flag to true when connected
      this.logger.log('Connected to MQTT broker');
    });

    this.mqttClient.on('error', (error: any) => {
      if (this.mqttConnected) {
        this.logger.error('Error in connecting to MQTT broker', error);
        this.mqttConnected = false;  // Reset flag to false on error
      }
    });
  }

  /**
   * Publish a message to the specified MQTT topic.
   * @param {string} topic - The MQTT topic to publish to.
   * @param {string} payload - The message payload to publish.
   * @returns {Promise<string>} - A promise that resolves to a confirmation message.
   */
  async publish(topic: string, payload: string): Promise<string> {
    this.logger.log(`Publishing to ${topic}`);
    this.deviceName = topic.split('/');
    this.logger.debug('Payload', payload);
    await this.cacheManager.set(topic, payload, 1000);
    this.mqttClient.publish(topic, payload);
    return `Publishing to ${topic} ${payload}`;
  }

  /**
   * Retrieve a cached message for a specific MQTT topic.
   * @param {string} topic - The MQTT topic to retrieve the cached message for.
   * @returns {Promise<string>} - A promise that resolves to the cached message.
   */
  async getCachedMessage(topic: string): Promise<string> {
    const cachedMessage = await this.cacheManager.get<string | any>(topic);
    if (cachedMessage) {
      this.logger.log(`Retrieved cached message for ${topic}: ${cachedMessage}`);
    } else {
      this.logger.log(`No cached message found for ${topic}`);
    }
    return cachedMessage;
  }

  /**
   * Subscribe to an MQTT topic and handle incoming messages.
   * @param {string} topic - The MQTT topic to subscribe to.
   * @param {function} messageHandler - The handler function to process incoming messages.
   */
  subscribe(topic: string, messageHandler: (message: string) => void) {
    this.mqttClient.subscribe(topic, (err: any) => {
      if (err) {
        this.logger.error(`Failed to subscribe to topic ${topic}`, err);
      } else {
        this.logger.log(`Subscribed to topic ${topic}`);
      }
    });

    this.mqttClient.on('message', (receivedTopic: string, message: Buffer) => {
      if (receivedTopic === topic || topic === '#') {
        const messageStr = message.toString();
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
        this.logger.log(`Received message from ${receivedTopic}: ${messageStr}`);
        messageHandler(messageStr);
      }
    });
  }

  /**
   * Publish a message from Cumulocity IoT to the local MQTT broker.
   * @param {string} topic - The MQTT topic to publish to.
   * @param {string} payload - The message payload to publish.
   * @returns {Promise<string>} - A promise that resolves to a confirmation message.
   */
  async publishFromCumulocity(topic: string, payload: string): Promise<string> {
    this.logger.log(`Publishing to ${topic} payload ${payload}`);
    await this.cacheManager.set(topic, payload, 1000);
    this.cumulocityClient.on('message', (topic: string, message: Buffer) => {
      this.logger.log(`Topic ${topic} message ${message.toString()}`);
      this.logger.log(`Command from Cumulocity: ${message.toString()}`);
      if (topic === 's/ds') {
        const command = message.toString().split(',');
        if (command[0] === '518') {
          let powerState;
          command[2] === 'CLOSED' ? (powerState = '1') : (powerState = '0');
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
      return `Topic: ${topic}, message: ${payload}`;
    });

    process.on('SIGINT', () => {
      this.mqttClient.end();
      this.cumulocityClient.end();
      this.logger.log('Disconnecting clients on shutdown');
      process.exit();
    });
    return `Publishing to ${topic} ${payload}`;
  }
}
