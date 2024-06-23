/**
 * User PubSub Message Patterns
 */

export enum PSCOLLABORATION {
  // CUSTOM
  GETDOCUMENTS = 'collaboration:getDocuments',
  GETMESSAGES = 'collaboration:getMessages',
  GETNOTIFICATIONS = 'collaboration:getNotifications',
  GETSPACES = 'collaboration:getSpaces',
  GETDOCUMENTBYID = 'collaboration:getDocumentById',
  GETSPACEBYID = 'collaboration:getSpaceById',
  GETPINSOFSPACEBYID = 'collaboration:getPinsOfSpaceById',
  // CRUD
  // Do not change the pattern below this line
  GET = 'collaboration:get',
  GETONE = 'collaboration:getOne',
  POST = 'collaboration:post',
  PUT = 'collaboration:put',
  CREATE = 'collaboration:create',
  DELETE = 'collaboration:delete',
}
