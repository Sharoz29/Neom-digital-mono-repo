import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { IoTQueues } from '@neom/shared';
import { ClientProxy } from '@nestjs/microservices';
import { environment } from '@neom/shared/lib/environments/dev';
import { connect } from 'mqtt';
import * as fs from 'fs';
import * as path from 'path';
import {
  Injectable,
  Inject,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseDomainService } from '../services/domain.service';
import { CreateAlarmDto, UpdateAlarmDto, IotMqttCreateVm, IotMqttVm } from '@neom/models';
import axios from 'axios';
import { from, of, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

/**
 * Service to handle MQTT domain operations for IoT.
 * Extends the BaseDomainService to implement domain-specific functionalities.
 */
@Injectable()
export class IotMqttDomainService extends BaseDomainService<
  IotMqttVm,
  IotMqttVm,
  IotMqttVm
> {
  override readonly logger = new Logger(IotMqttDomainService.name);
  private mqttClient: any;
  private cumulocityClient: any;
  private mqttConnected = false;
  private cumulocityClients: { [key: string]: any } = {}; // Store connections for each device
  private deviceClientsFilePath = path.resolve(
    process.cwd(),
    'workers/iot-worker/src/assets/deviceClients.json'
  ); // Path to store device client IDs

  /**
   * Constructor to inject dependencies.
   * @param {ClientProxy} _client - The client proxy instance for microservices communication.
   * @param {Cache} cacheManagerRef - The cache manager instance.
   */
  constructor(
    @Inject(CACHE_MANAGER) private cacheManagerRef: Cache,
    @Inject(IoTQueues.IoT_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, cacheManagerRef, 'iot-mqtt');
    this.initMqttClient();
    this.ensureDeviceClientsFileExists(); // Ensure the JSON file exists
    this.initCumulocityClients(); // Initialize all cumulocity clients
  }

  async onModuleInit() {
    await this.initializeDeviceSubscriptions().toPromise();
  }

  /**
   * Initializes the MQTT client.
   */
  private initMqttClient(): void {
    const connectUrl = `mqtt://${environment.mqtt.host}:${environment.mqtt.port}`;
    this.logger.log(`Connecting to MQTT broker at ${connectUrl}`);

    this.mqttClient = connect(connectUrl, {
      clientId: environment.mqtt.cliendID,
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
   * Initializes the Cumulocity clients for all devices listed in the JSON file.
   * Note: This approach is valid until the database is implemented, after which
   * the contents of this file will be stored in a database.
   */
  private initCumulocityClients(): void {
    const deviceClients = this.loadDeviceClients();
    for (const deviceName in deviceClients) {
      const clientId = deviceClients[deviceName];
      this.initCumulocityClient(deviceName, clientId);
    }
  }

  /**
   * Initializes the Cumulocity client for a specific device.
   * @param {string} deviceName - The name of the device.
   * @param {string} clientId - The client ID for the Cumulocity client.
   */
  private initCumulocityClient(deviceName: string, clientId: string): void {
    const cumulocityUrl = environment.cumulocity.url;
    this.logger.log(
      `Connecting to Cumulocity IoT for ${deviceName} at ${cumulocityUrl} with clientId ${clientId}`
    );

    const cumulocityClient = connect(cumulocityUrl, {
      username: `${environment.cumulocity.tenantid}/${environment.cumulocity.username}`,
      password: environment.cumulocity.password,
      clientId,
    });

    cumulocityClient.on('connect', () => {
      this.logger.log(`Connected to Cumulocity IoT for device ${deviceName}`);
    });

    cumulocityClient.subscribe(clientId, (err: any) => {
      const topic = `s/us/${clientId}`;
      if (!err) {
        this.logger.log(`Subscribed to topic ${topic}`);
      } else {
        this.logger.error(`Failed to subscribe to topic ${topic}`, err);
      }
    });

    cumulocityClient.on('message', (topic: string, message: any) => {
      this.logger.log(
        `Received message ${message} from cumulocity topic ${topic}`
      );
    });

    cumulocityClient.on('error', (error: any) => {
      this.logger.error(
        `Cumulocity IoT Connection Error for device ${deviceName}`,
        error
      );
    });

    cumulocityClient.on('close', () => {
      this.logger.log(
        `Cumulocity IoT Connection closed for device ${deviceName}`
      );
    });

    this.cumulocityClients[deviceName] = cumulocityClient; // Store the client in the map
  }

  /**
   * Ensures the JSON file for storing device client IDs exists.
   */
  private ensureDeviceClientsFileExists(): void {
    if (!fs.existsSync(this.deviceClientsFilePath)) {
      fs.writeFileSync(this.deviceClientsFilePath, JSON.stringify({}, null, 2));
      this.logger.log(
        `Device clients file created at: ${this.deviceClientsFilePath}`
      );
    } else {
      this.logger.log(
        `Device clients file already exists at: ${this.deviceClientsFilePath}`
      );
    }
  }

  /**
   * Loads device clients from the JSON file.
   * @returns {Object} The device clients.
   */
  private loadDeviceClients(): { [key: string]: string } {
    if (fs.existsSync(this.deviceClientsFilePath)) {
      const data = fs.readFileSync(this.deviceClientsFilePath, 'utf8');
      return JSON.parse(data);
    }
    return {};
  }

  /**
   * Saves a device client ID to the JSON file.
   * @param {string} deviceName - The name of the device.
   * @param {string} clientId - The client ID to save.
   */
  private saveDeviceClient(deviceName: string, clientId: string): void {
    const deviceClients = this.loadDeviceClients();
    deviceClients[deviceName] = clientId;

    this.logger.log(
      `Saving device client: ${deviceName} with clientId: ${clientId}`
    );
    fs.writeFileSync(
      this.deviceClientsFilePath,
      JSON.stringify(deviceClients, null, 2),
      'utf8'
    );
    this.logger.log(
      `Device client saved: ${JSON.stringify(deviceClients, null, 2)}`
    );
  }

  /**
   * Retrieves a device client ID from the JSON file.
   * @param {string} deviceName - The name of the device.
   * @returns {string | undefined} The client ID, if found.
   */
  private getDeviceClient(deviceName: string): string | undefined {
    const deviceClients = this.loadDeviceClients();
    return deviceClients[deviceName];
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
   * Clears a specific cache key.
   * @param {string} cacheKey - The cache key to clear.
   * @returns {Observable<void>}
   */
  clearCacheKey(cacheKey: string): Observable<void> {
    return from(this.cacheManagerRef.del(cacheKey)).pipe(
      tap(() => this.logger.log(`Cache cleared for key: ${cacheKey}`))
    );
  }

  /**
   * Publishes a message to the MQTT broker.
   *
   * @param {IotMqttCreateVm} param0 - The message DTO containing the pattern and message.
   * @returns {Observable<any>} The result of the publish operation.
   * @throws {HttpException} If the MQTT client is not connected or if an error occurs while publishing the message.
   */
  publishTopicToMqttBroker({
    pattern,
    message,
  }: IotMqttCreateVm): Observable<any> {
    if (!this.mqttConnected) {
      throw new HttpException(
        'MQTT client not connected',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    this.logger.log(
      `Publishing to MQTT topic: ${pattern} with message: ${message}`
    );

    return new Observable((observer) => {
      this.mqttClient.publish(pattern, message, (error: any) => {
        if (error) {
          this.logger.error('Failed to publish message to MQTT broker', error);
          observer.error(
            new HttpException(
              'Failed to publish message',
              HttpStatus.INTERNAL_SERVER_ERROR
            )
          );
        } else {
          this.logger.log('Message published to MQTT broker');
          observer.next({
            status: 'success',
            message: 'Message published to MQTT broker',
          });
          observer.complete();
        }
      });
    });
  }

  /**
   * Publishes a message from Cumulocity IoT to the MQTT broker.
   *
   * @param {IotMqttCreateVm} body - The message DTO containing the pattern and message.
   * @returns {Observable<string>} The result of the publish operation.
   */
  publishMessageFromCumulocityIoT(body: IotMqttCreateVm): Observable<any> {
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
    return of(`Publishing to ${body.pattern} ${body.message}`);
  }

  /**
   * Initializes subscriptions for all devices.
   * @returns {Observable<void>}
   */
  initializeDeviceSubscriptions(): Observable<void> {
    return from(this.fetchAllDeviceDetailsFromCumulocity()).pipe(
      switchMap((devices) => from(devices)),
      tap((device: { name: string }) => {
        this.subscribeToDeviceTopic(device.name);
      }),
      tap(() =>
        this.logger.log('Device subscriptions successfully initialized.')
      ),
      catchError((error) => {
        this.logger.error('Error initializing device subscriptions:', error);
        throw error;
      }),
      map(() => undefined)
    );
  }

  /**
   * Fetches details for all devices from Cumulocity.
   * @returns {Observable<any[]>} The details of all devices.
   * @throws {HttpException} If an error occurs while fetching device details.
   */
  fetchAllDeviceDetailsFromCumulocity(): Observable<any[]> {
    const base64EncodedCredentials = Buffer.from(
      `${environment.cumulocity.username}:${environment.cumulocity.password}`
    ).toString('base64');

    const config = {
      headers: {
        Authorization: `Basic ${base64EncodedCredentials}`,
        Accept: 'application/json',
      },
      params: {
        pageSize: 100, // Adjust based on how many devices you expect to fetch
        withTotalPages: true, // Optional, based on API support
      },
    };

    return from(axios.get(environment.cumulocity.deviceUrl, config)).pipe(
      map((response) => response.data.managedObjects), // Adjust depending on actual API response structure
      catchError((error) => {
        this.logger.error(
          'Failed to fetch all device details from Cumulocity',
          error
        );
        throw new HttpException(
          'Failed to fetch all device details from Cumulocity',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      })
    );
  }

  /**
   * Fetches device details from Cumulocity.
   * @param {string} deviceId - The ID of the device in Cumulocity.
   * @returns {Observable<any>} The device details.
   * @throws {HttpException} If an error occurs while fetching device details.
   */
  fetchDeviceDetailsFromCumulocity(deviceId: string): Observable<any> {
    const url = `https://trialfdlpkgyf727j.eu-latest.cumulocity.com/inventory/managedObjects/${deviceId}`;
    const base64EncodedCredentials = Buffer.from(
      `${environment.cumulocity.username}:${environment.cumulocity.password}`
    ).toString('base64');

    const config = {
      headers: {
        Authorization: `Basic ${base64EncodedCredentials}`,
        Accept: 'application/json',
      },
    };

    return from(axios.get(url, config)).pipe(
      map((response) => {
        this.logger.log(
          `Device details fetched: ${JSON.stringify(response.data)}`
        );
        return response.data;
      }),
      catchError((error) => {
        this.logger.error(
          'Failed to fetch device details from Cumulocity',
          error
        );
        throw new HttpException(
          'Failed to fetch device details from Cumulocity',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      })
    );
  }

  /**
   * Registers and subscribes a device to Cumulocity.
   * @param {string} deviceName - The name of the device.
   * @returns {Observable<any>} The result of the registration and subscription.
   */
  registerAndSubscribeDevices(deviceName: string): Observable<any> {
    if (deviceName) {
      return from(this.registerDeviceToCumulocity(deviceName)).pipe(
        tap(() => this.subscribeToDeviceTopic(deviceName))
      );
    }
    return of(null);
  }

  /**
   * Subscribes to a device's MQTT topic and handles incoming messages.
   * @param {string} deviceName - The name of the device.
   */
  private subscribeToDeviceTopic(deviceName: string) {
    const topic = `tele/${deviceName}/SENSOR`;
    this.mqttClient.subscribe(topic, (err: any, granted: any) => {
      if (err) {
        this.logger.error(`Failed to subscribe to topic ${topic}:`, err);
      } else {
        this.logger.log(`Subscribed to topic ${topic}`);
        // Listen for messages on this topic.
        this.mqttClient.on('message', (receivedTopic: string, message: any) => {
          // Ensure that messages are processed only for the subscribed topic
          if (receivedTopic === topic) {
            this.handleDeviceData(receivedTopic, message);
          }
        });
      }
    });
  }

  /**
   * Registers a device to Cumulocity and subscribes it to a topic.
   * @param {string} deviceName - The name of the device.
   * @returns {Observable<string>} The client ID of the registered device.
   */
  registerDeviceToCumulocity(deviceName: string): Observable<any> {
    const cacheKey = `device-registration-${deviceName}`;
    return this.clearCacheKey(cacheKey).pipe(
      switchMap(() => from(this.cacheManagerRef.get<boolean>(cacheKey))),
      switchMap((isRegistered) => {
        this.logger.log(
          `Cache check for ${deviceName}: isRegistered = ${isRegistered}`
        );

        if (!isRegistered) {
          this.logger.log(`Registering device with name: ${deviceName}`);
          const clientId = `c8y-${deviceName}-${Math.random()
            .toString(16)
            .slice(2)}`; // Unique client ID for each device
          const registrationMessage = `100,${deviceName},c8y_MQTTDevice`;
          this.logger.log(`Registration Message: ${registrationMessage}`);

          // Initialize the client for this device
          this.initCumulocityClient(deviceName, clientId);
          const cumulocityClient = this.cumulocityClients[deviceName];

          return new Observable<string>((observer) => {
            cumulocityClient.on('connect', () => {
              cumulocityClient.publish(
                's/us',
                registrationMessage,
                async (error: any) => {
                  if (!error) {
                    await this.cacheManagerRef.set(cacheKey, true);
                    this.saveDeviceClient(deviceName, clientId); // Save the client ID to the JSON file
                    this.logger.log(
                      `Device ${deviceName} successfully registered with clientId ${clientId}.`
                    );
                    observer.next(clientId);
                    observer.complete();
                  } else {
                    this.logger.error(
                      `Failed to register device ${deviceName}`,
                      error
                    );
                    observer.error(error);
                  }
                }
              );
            });

            cumulocityClient.on('error', (error: any) => {
              this.logger.error(
                `Failed to connect Cumulocity IoT for device ${deviceName}`,
                error
              );
              observer.error(error);
            });
          });
        } else {
          this.logger.log(`Device ${deviceName} already registered.`);
          return of(this.getDeviceClient(deviceName)); // Retrieve the client ID from the JSON file
        }
      })
    );
  }

  /**
   * Subscribes to a specified MQTT topic and handles incoming messages.
   *
   * @param {string} topic - The MQTT topic to subscribe to.
   * @returns {Observable<any>} The result of the subscription operation.
   * @throws {HttpException} If the MQTT client is not connected or if an error occurs while subscribing to the topic.
   */
  subscribeToMqttBroker(topic: string): Observable<any> {
    if (!this.mqttConnected) {
      throw new HttpException(
        'MQTT client not connected',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    this.logger.log(`Subscribing to MQTT topic: ${topic}`);

    return new Observable((observer) => {
      this.mqttClient.subscribe(topic, (err: any) => {
        if (err) {
          this.logger.error(`Failed to subscribe to topic ${topic}`, err);
          observer.error(
            new HttpException(
              'Failed to subscribe to topic',
              HttpStatus.INTERNAL_SERVER_ERROR
            )
          );
        } else {
          this.logger.log(`Subscribed to topic ${topic}`);
          observer.next({
            status: 'success',
            message: `Subscribed to topic ${topic}`,
          });
          observer.complete();
        }
      });

      this.mqttClient.on(
        'message',
        (receivedTopic: string, message: Buffer) => {
          this.handleDeviceData(receivedTopic, message);
        }
      );
    });
  }

  /**
   * Handles incoming device data and processes it based on the topic.
   * @param {string} topic - The MQTT topic.
   * @param {Buffer} message - The message payload.
   */
  handleDeviceData(topic: string, message: Buffer) {
    const deviceName = topic.split('/')[1];
    const cacheKey = `device-registration-${deviceName}`;
    from(this.cacheManagerRef.get<boolean>(cacheKey))
      .pipe(
        tap((isRegistered) => {
          if (!isRegistered) {
            this.logger.log(
              `Device ${deviceName} not found in cache. Checking registration status.`
            );
            // Optionally, register the device or queue data until registration is confirmed
            return;
          }

          const payload = JSON.parse(message.toString());
          if (payload.SI7021) {
            this.handleTemperatureData(deviceName, payload);
          } else if (payload.AM2301) {
            this.handleTemperatureData(deviceName, payload);
          } else if (payload.ENERGY) {
            this.handlePowerData(deviceName, payload);
          } else {
            this.logger.error(
              `Unrecognized data format received from ${deviceName}`
            );
          }
        })
      )
      .subscribe();
  }

  /**
   * Handles incoming temperature data from a device and sends it to Cumulocity.
   * @param {string} deviceName - The name of the device.
   * @param {any} payload - The data payload containing temperature information.
   */
  private handleTemperatureData(deviceName: string, payload: any) {
    const { Temperature, Humidity, DewPoint } = payload.SI7021;
    const timestamp = new Date().toISOString();
    const measurementMessage =
      `201,TemperatureMeasurement,${timestamp},` +
      `c8y_TemperatureMeasurement,Temperature,${Temperature},C,` +
      `c8y_HumidityMeasurement,Humidity,${Humidity},%,` +
      `c8y_DewPointMeasurement,DewPoint,${DewPoint},C`;

    this.logger.log(
      `Sending temperature data to Cumulocity for ${deviceName}, measurement: ${measurementMessage}`
    );

    const cumulocityClient = this.cumulocityClients[deviceName];
    if (cumulocityClient) {
      cumulocityClient.publish('s/us', measurementMessage);
    } else {
      this.logger.error(`Cumulocity client not found for device ${deviceName}`);
    }
  }

  /**
   * Handles incoming power data from a device and sends it to Cumulocity.
   * @param {string} deviceName - The name of the device.
   * @param {any} payload - The data payload containing power information.
   */
  private handlePowerData(deviceName: string, payload: any) {
    const { Power, Voltage, Current, Yesterday, Today } = payload.ENERGY;
    const timestamp = new Date().toISOString();
    const measurementMessage =
      `201,EnergyMeasurement,${timestamp},` +
      `c8y_EnergyMeasurement,Power,${Power},W,` +
      `c8y_EnergyMeasurement,Voltage,${Voltage},V,` +
      `c8y_EnergyMeasurement,Current,${Current},A,` +
      `c8y_EnergyMeasurement,Energy_Yesterday,${Yesterday},kWh,` +
      `c8y_EnergyMeasurement,Energy_Today,${Today},kWh`;

    this.logger.log(
      `Sending power data to Cumulocity for ${deviceName} values: ${measurementMessage}`
    );

    const cumulocityClient = this.cumulocityClients[deviceName];
    if (cumulocityClient) {
      cumulocityClient.publish('s/us', measurementMessage);
    } else {
      this.logger.error(`Cumulocity client not found for device ${deviceName}`);
    }
  }

  createAlarmForDevice(body: CreateAlarmDto): Observable<any> {
    const url = `https://${environment.cumulocity.tenantid}.eu-latest.cumulocity.com/alarm/alarms`;
    const base64EncodedCredentials = Buffer.from(
      `${environment.cumulocity.username}:${environment.cumulocity.password}`
    ).toString('base64');

    const config = {
      headers: {
        Authorization: `Basic ${base64EncodedCredentials}`,
        Accept: 'application/json',
      },
    };

    // Log payload for debugging
    this.logger.log(
      `Payload to be sent to Cumulocity: ${JSON.stringify(body)}`
    );

    return from(axios.post(url, body, config)).pipe(
      map((response) => {
        this.logger.log(
          `Device alarm created: ${JSON.stringify(response.data)}`
        );
        return response.data;
      }),
      catchError((error) => {
        this.logger.error('Failed to create device alarm', error);
        throw new HttpException(
          'Failed to create device alarm for cumulocity',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      })
    );
  }

  getAlarms(): Observable<any> {
    const url = `https://${environment.cumulocity.tenantid}.eu-latest.cumulocity.com/alarm/alarms`;
    const base64EncodedCredentials = Buffer.from(
      `${environment.cumulocity.username}:${environment.cumulocity.password}`
    ).toString('base64');

    const config = {
      headers: {
        Authorization: `Basic ${base64EncodedCredentials}`,
        Accept: 'application/json',
      },
    };

    return from(axios.get(url, config)).pipe(
      map((response) => {
        this.logger.log(`Alarms Retrieved: ${JSON.stringify(response.data)}`);
        return response.data;
      }),
      catchError((error) => {
        this.logger.error('Failed to retrieve alarms', error);
        throw new HttpException(
          'Failed to retrieve alarms from cumulocity',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      })
    );
  }

  /**
   * Updates multiple alarms in Cumulocity.
   * @param {any} payload - The payload to update alarms.
   * @returns {Observable<any>} Response from Cumulocity.
   */
  updateAlarmCollection(payload: any): Observable<any> {
    const url = `https://${environment.cumulocity.tenantid}.eu-latest.cumulocity.com/alarm/alarms`;
    const config = this.getAuthConfig();

    this.logger.log(`Updating alarm collection with payload: ${JSON.stringify(payload)}`);

    return from(axios.put(url, payload, config)).pipe(
      tap((response) => this.logger.log(`Alarms updated successfully: ${JSON.stringify(response.data)}`)),
      map((response) => response.data),
      catchError((error) => {
        this.logger.error('Failed to update alarm collection', error);
        throw new HttpException('Failed to update alarm collection', HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }

  /**
   * Removes multiple alarms based on query.
   * @param {any} query - The query parameters to filter alarms for deletion.
   * @returns {Observable<any>} Response from Cumulocity.
   */
  removeAlarmCollection(query: any): Observable<any> {
    const url = `https://${environment.cumulocity.tenantid}.eu-latest.cumulocity.com/alarm/alarms`;
    const config = { ...this.getAuthConfig(), params: query };

    this.logger.log(`Removing alarm collection with query: ${JSON.stringify(query)}`);

    return from(axios.delete(url, config)).pipe(
      tap(() => this.logger.log('Alarm collection removed successfully')),
      catchError((error) => {
        this.logger.error('Failed to remove alarm collection', error);
        throw new HttpException('Failed to remove alarm collection', HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }

  /**
   * Retrieves details of a specific alarm.
   * @param {string} alarmId - The ID of the alarm to retrieve.
   * @returns {Observable<any>} The alarm details.
   */
  getSpecificAlarm(alarmId: string): Observable<any> {
    const url = `https://${environment.cumulocity.tenantid}.eu-latest.cumulocity.com/alarm/alarms/${alarmId}`;
    const config = this.getAuthConfig();

    this.logger.log(`Fetching specific alarm with ID: ${alarmId}`);

    return from(axios.get(url, config)).pipe(
      map((response) => response.data),
      tap((data) => this.logger.log(`Alarm details retrieved: ${JSON.stringify(data)}`)),
      catchError((error) => {
        this.logger.error(`Failed to retrieve alarm with ID ${alarmId}`, error);
        throw new HttpException('Failed to retrieve alarm', HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }

  /**
   * Updates a specific alarm in Cumulocity.
   * @param {string} alarmId - The ID of the alarm to update.
   * @param {UpdateAlarmDto} body - The update payload.
   * @returns {Observable<any>} Response from Cumulocity.
   */
  updateSpecificAlarm(alarmId: string, body: UpdateAlarmDto): Observable<any> {
    const url = `https://${environment.cumulocity.tenantid}.eu-latest.cumulocity.com/alarm/alarms/${alarmId}`;
    const config = this.getAuthConfig();

    this.logger.log(`Inside DomainService: alarmId=${alarmId}, payload=${JSON.stringify(body)}`);


    return from(axios.put(url, body, config)).pipe(
      map((response) => response.data),
      tap((data) => this.logger.log(`Alarm updated successfully: ${JSON.stringify(data)}`)),
      catchError((error) => {
        this.logger.error(`Failed to update alarm with ID ${alarmId}`, error);
        throw new HttpException('Failed to update alarm', HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }

  /**
   * Retrieves the total count of alarms from Cumulocity.
   * @returns {Observable<any>} The total alarm count.
   */
  getTotalAlarmCount(): Observable<any> {
    const url = `https://${environment.cumulocity.tenantid}.eu-latest.cumulocity.com/alarm/alarms/count`;
    const config = this.getAuthConfig();

    this.logger.log('Fetching total alarm count');

    return from(axios.get(url, config)).pipe(
      map((response) => response.data),
      tap((data) => this.logger.log(`Total alarm count retrieved: ${JSON.stringify(data)}`)),
      catchError((error) => {
        this.logger.error('Failed to fetch total alarm count', error);
        throw new HttpException('Failed to fetch total alarm count', HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }

  /**
   * Helper method to get Axios configuration with authorization headers.
   * @returns {object} Axios request config.
   */
  private getAuthConfig(): any {
    const base64EncodedCredentials = Buffer.from(
      `${environment.cumulocity.username}:${environment.cumulocity.password}`
    ).toString('base64');

    return {
      headers: {
        Authorization: `Basic ${base64EncodedCredentials}`,
        Accept: 'application/json',
      },
    };
  }
}
