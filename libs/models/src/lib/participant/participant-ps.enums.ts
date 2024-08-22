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

  POSTV1 = 'participant:postV1',
  POSTV2 = 'participant:postV2',

  PUTV1 = 'participant:putV1',
  PUTV2 = 'participant:putV2',

  CREATEV1 = 'participant:createV1',
  CREATEV2 = 'participant:createV2',

  DELETEV1 = 'participant:deleteV1',
  DELETEV2 = 'participant:deleteV2',
}
