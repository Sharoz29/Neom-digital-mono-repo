/**
 * User PubSub Message Patterns
 */

export enum PSCOLLABORATION {
  // CUSTOM
  GETDOCUMENTSV1 = 'collaboration:getDocumentsV1',
  GETDOCUMENTSV2 = 'collaboration:getDocumentsV2',

  GETMESSAGESV1 = 'collaboration:getMessagesV1',
  GETMESSAGESV2 = 'collaboration:getMessagesV2',

  GETNOTIFICATIONSV1 = 'collaboration:getNotificationsV1',
  GETNOTIFICATIONSV2 = 'collaboration:getNotificationsV2',

  GETSPACESV1 = 'collaboration:getSpacesV1',
  GETSPACESV2 = 'collaboration:getSpacesV2',

  GETDOCUMENTBYIDV1 = 'collaboration:getDocumentByIdV1',
  GETDOCUMENTBYIDV2 = 'collaboration:getDocumentByIdV2',

  GETSPACEBYIDV1 = 'collaboration:getSpaceByIdV1',
  GETSPACEBYIDV2 = 'collaboration:getSpaceByIdV2',

  GETPINSOFSPACEBYIDV1 = 'collaboration:getPinsOfSpaceByIdV1',
  GETPINSOFSPACEBYIDV2 = 'collaboration:getPinsOfSpaceByIdV2',
  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'collaboration:getV1',
  GETV2 = 'collaboration:getV2',

  GETONEV1 = 'collaboration:getOneV1',
  GETONEV2 = 'collaboration:getOneV2',

  POSTV1 = 'collaboration:post',
  POSTV2 = 'collaboration:postV2',

  PUTV1 = 'collaboration:put',
  PUTV2 = 'collaboration:putV2',

  CREATEV1 = 'collaboration:createV1',
  CREATEV2 = 'collaboration:createV2',

  DELETEV1 = 'collaboration:deleteV1',
  DELETEV2 = 'collaboration:deleteV2',
}
