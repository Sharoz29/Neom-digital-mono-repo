/**
 * User PubSub Message Patterns
 */

export enum PSIOT_MQTT {
  // CUSTOM
  PUBLISH = 'publish/:topic/:message',
  PUBLISHFROMCUMULOCITY = 'publish-from-cumulocity/:topic/:mesage',
  DEVICEDETAILSFROMCUMULOCITY = 'fetchDeviceDetailsFromCumulocity/:deviceID',
  REGISTERDEVICETOCUMULOCITY = 'registerDeviceToCumulocity/:topic',
  SUBSCRIBE = 'subscribe-to-mqtt-broker/:topic',
  CREATEALARM = 'createalarm/:alarm',
  GETALARMS = 'alarm/:alarms',
  UPDATEALARM = 'updatealarm/:alarmId',
  REMOVEALARM = 'removealarm/:alarmId',
  GETSPECIFICALARM = 'getalarm/:alarmId',
  REMOVEALARMCOLLECTION = 'removealarms',
  UPDATEALARMCOLLECTION = 'updatealarms',
  GETALARMCOUNT = 'getalarmcount',

  // CRUD
  // Do not change the pattern below this line
  GET = 'iotMqtt:get',
  GETONE = 'iotMqtt:getOne',
  POST = 'iotMqtt:post',
  PUT = 'iotMqtt:put',
  CREATE = 'iotMqtt:create',
  DELETE = 'iotMqtt:delete',
}
