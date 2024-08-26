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

  POSTV1 = 'attachment:postV1',
  POSTV2 = 'attachment:postV2',

  PUTV1 = 'attachment:putV1',
  PUTV2 = 'attachment:put',

  CREATEV1 = 'attachment:createV1',
  CREATEV2 = 'attachment:create',

  DELETEV1 = 'attachment:deleteV1',
  DELETEV2 = 'attachment:delete',
}
