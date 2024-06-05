/**
 * User PubSub Message Patterns
 */

export enum PSASSIGNMENT {
  // CUSTOM
  GETFIELDS = 'assignment:getFields',

  // CRUD
  // Do not change the pattern below this line
  GET = 'assignment:get',
  GETONE = 'assignment:getOne',
  POST = 'assignment:post',
  PUT = 'assignment:put',
  CREATE = 'assignment:create',
  DELETE = 'assignment:delete',
}
