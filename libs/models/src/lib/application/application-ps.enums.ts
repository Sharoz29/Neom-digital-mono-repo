/**
 * User PubSub Message Patterns
 */

export enum PSAPPLICATION {
  // CUSTOM
  GETVERSION = 'application:getVersion',
  // CRUD
  // Do not change the pattern below this line
  GET = 'application:get',
  GETONE = 'application:getOne',
  POST = 'application:post',
  PUT = 'application:put',
  CREATE = 'application:create',
  DELETE = 'application:delete',
}
