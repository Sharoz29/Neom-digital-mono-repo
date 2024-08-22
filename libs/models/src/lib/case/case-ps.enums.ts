/**
 * User PubSub Message Patterns
 */

export enum PSCASE {
  // CUSTOM
  GETACTIONSV1 = 'case:getActionsV1',
  GETACTIONSV2 = 'case:getActionsV2',

  GETATTACHMENTSV1 = 'case:getAttachmentsV1',
  GETATTACHMENTS = 'case:getAttachmentsV2',

  GETPAGEV1 = 'case:getPageV1',
  GETPAGEV2 = 'case:getPageV2',

  GETVIEWV1 = 'case:getViewV1',
  GETVIEWV2 = 'case:getViewV2',

  GETANCESTORSV1 = 'case:getAncestorsV1',
  GETANCESTORSV2 = 'case:getAncestorsV2',

  GETDESCENDANTSV1 = 'case:getDecendantsV1',
  GETDESCENDANTSV2 = 'case:getDecendantsV2',

  GETSTAGESV1 = 'case:getStagesV1',
  GETSTAGESV2 = 'case:getStagesV2',

  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'case:getV1',
  GETV2 = 'case:getV2',

  GETONEV1 = 'case:getOneV1',
  GETONEV2 = 'case:getOneV2',

  POST = 'case:post',
  PUT = 'case:put',
  CREATE = 'case:create',
  DELETE = 'case:delete',
}
