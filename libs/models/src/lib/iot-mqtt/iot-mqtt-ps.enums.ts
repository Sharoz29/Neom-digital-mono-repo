/**
 * User PubSub Message Patterns
 */

export enum PSIOT_MQTT {
  // CUSTOM
  PUBLISH = 'iotMqtt:publish',

  // CRUD
  // Do not change the pattern below this line
  GET = 'iotMqtt:get',
  GETONE = 'iotMqtt:getOne',
  POST = 'iotMqtt:post',
  PUT = 'iotMqtt:put',
  CREATE = 'iotMqtt:create',
  DELETE = 'iotMqtt:delete',
}
