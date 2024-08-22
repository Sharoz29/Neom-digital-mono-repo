/**
 * User PubSub Message Patterns
 */

export enum PSDOCUMENT {
  // CUSTOM

  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'document:getV1',
  GETV2 = 'document:getV2',

  GETONEV1 = 'document:getOneV1',
  GETONEV2 = 'document:getOneV2',

  POST = 'document:post',
  PUT = 'document:put',
  CREATE = 'document:create',
  DELETE = 'document:delete',
}
