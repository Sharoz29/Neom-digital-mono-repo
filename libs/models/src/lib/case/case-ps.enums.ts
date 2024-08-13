/**
 * User PubSub Message Patterns
 */

export enum PSCASE {
  // CUSTOM
  GETACTIONS = 'case:getActions',
  GETATTACHMENTS = 'case:getAttachments',
  GETPAGE = 'case:getPage',
  GETVIEW = 'case:getView',
  GETANCESTORS = 'case:getAncestors',
  GETDESCENDANTS = 'case:getDecendants',
  GETSTAGES = 'case:getStages',

  // CRUD
  // Do not change the pattern below this line
  GET = 'case:get',
  GETONE = 'case:getOne',
  POST = 'case:post',
  PUT = 'case:put',
  CREATE = 'case:create',
  DELETE = 'case:delete',
}
