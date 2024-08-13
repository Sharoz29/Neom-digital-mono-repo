/**
 * User PubSub Message Patterns
 */

export enum PSDATA {
  // CUSTOM
  GETMETADATA = 'data:getMetaData',
  GETDATAOBJECTS = 'data:getDataObjects',
  GETDATAPAGES = 'data:getDataPages',
  GETDATAPAGEVIEWS = 'data:getDataPageViews',
  GETDATAPAGEVIEWMETADATA = 'data:getDataPageViewMetaData',
  // CRUD
  // Do not change the pattern below this line
  GET = 'data:get',
  GETONE = 'data:getOne',
  POST = 'data:post',
  PUT = 'data:put',
  CREATE = 'data:create',
  DELETE = 'data:delete',
}
