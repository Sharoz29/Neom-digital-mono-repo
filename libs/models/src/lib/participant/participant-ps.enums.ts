/**
 * User PubSub Message Patterns
 */

export enum PSPARTICIPANT {
  // CUSTOM
  GETROLESV1 = 'participant:getRolesV1',
  GETROLESV2 = 'participant:getRolesV2',

  GETROLEDETAILSV1 = 'participant:getRoleDetailsV1',
  GETROLEDETAILSV2 = 'participant:getRoleDetailsV2',

  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'participant:getV1',
  GETV2 = 'participant:getV2',

  GETONEV1 = 'participant:getOneV1',
  GETONEV2 = 'participant:getOneV2',

  POST = 'participant:post',
  PUT = 'participant:put',
  CREATE = 'participant:create',
  DELETE = 'participant:delete',
}
