/**
 * User PubSub Message Patterns
 */

export enum PSATTACHMENT {
  // CUSTOM
  GETCASEATTACHMENTSV1 = 'attachment:getCaseAttachmentsV1',
  GETCASEATTACHMENTSV2 = 'attachment:getCaseAttachmentsV2',

  GETCASEATTACHMENTCATEGORIESV1 = 'attachment:getCaseAttachmentCategoriesV1',
  GETCASEATTACHMENTCATEGORIESV2 = 'attachment:getCaseAttachmentCategoriesV2',
  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'attachment:getV1',
  GETV2 = 'attachment:getV2',

  GETONEV1 = 'attachment:getOneV1',
  GETONEV2 = 'attachment:getOneV2',

  POST = 'attachment:post',
  PUT = 'attachment:put',
  CREATE = 'attachment:create',
  DELETE = 'attachment:delete',
}
