/**
 * User PubSub Message Patterns
 */

export enum PSPARTICIPANT {
  // CUSTOM
  GETROLES = 'participant:getRoles',
  GETROLEDETAILS = 'participant:getRoleDetails',
  // CRUD
  // Do not change the pattern below this line
  GET = 'participant:get',
  GETONE = 'participant:getOne',
  POST = 'participant:post',
  PUT = 'participant:put',
  CREATE = 'participant:create',
  DELETE = 'participant:delete',
}
