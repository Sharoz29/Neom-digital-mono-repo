/**
 * User PubSub Message Patterns
 */

export enum PSASSIGNMENT {
  // CUSTOM
  GETACTIONSV1 = 'assignment:getActionsV1',
  GETACTIONSV2 = 'assignment:getActionsV2',

  GETNEXTV1 = 'assignment:getNextV1',
  GETNEXTV2 = 'assignment:getNextV2',

  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'assignment:getV1',
  GETV2 = 'assignment:getV2',

  GETONEV1 = 'assignment:getOneV1',
  GETONEV2 = 'assignment:getOneV2',

  POSTV1 = 'assignment:postV1',
  POSTV2 = 'assignment:postV2',

  PUTV1 = 'assignment:putV1',
  PUTV2 = 'assignment:putV2',

  CREATEV1 = 'assignment:create',
  CREATEV2 = 'assignment:createV2',

  DELETEV1 = 'assignment:deleteV1',
  DELETEV2 = 'assignment:deleteV2',
}
