/**
 * User PubSub Message Patterns
 */

export enum PSATTACHMENT {
  // CUSTOM
  GETCASEATTACHMENTS = 'attachment:getCaseAttachments',
  GETCASEATTACHMENTCATEGORIES = 'attachment:getCaseAttachmentCategories',
  // CRUD
  // Do not change the pattern below this line
  GET = 'attachment:get',
  GETONE = 'attachment:getOne',
  POST = 'attachment:post',
  PUT = 'attachment:put',
  CREATE = 'attachment:create',
  DELETE = 'attachment:delete',
}
