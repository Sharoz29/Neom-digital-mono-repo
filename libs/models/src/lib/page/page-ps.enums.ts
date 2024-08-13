/**
 * User PubSub Message Patterns
 */

export enum PSPAGE {
  // CUSTOM
  GETCHANNEL = 'page:getChannel',
  GETDASHBOARD = 'page:getDashboard',
  GETINSIGHT = 'page:getInsight',
  GETPORTAL = 'page:getPortal',
  // CRUD
  // Do not change the pattern below this line
  GET = 'page:get',
  GETONE = 'page:getOne',
  POST = 'page:post',
  PUT = 'page:put',
  CREATE = 'page:create',
  DELETE = 'page:delete',
}
