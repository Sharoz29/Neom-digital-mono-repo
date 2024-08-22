/**
 * User PubSub Message Patterns
 */

export enum PSDATA {
  // CUSTOM
  GETMETADATAV1 = 'data:getMetaData',
  GETMETADATAV2 = 'data:getMetaData',

  GETDATAOBJECTSV1 = 'data:getDataObjects',
  GETDATAOBJECTSV2 = 'data:getDataObjects',

  GETDATAPAGESV1 = 'data:getDataPages',
  GETDATAPAGESV2 = 'data:getDataPages',

  GETDATAPAGEVIEWSV1 = 'data:getDataPageViews',
  GETDATAPAGEVIEWSV2 = 'data:getDataPageViews',

  GETDATAPAGEVIEWMETADATAV1 = 'data:getDataPageViewMetaData',
  GETDATAPAGEVIEWMETADATAV2 = 'data:getDataPageViewMetaData',

  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'data:get',
  GETV2 = 'data:get',

  GETONEV1 = 'data:getOne',
  GETONEV2 = 'data:getOne',

  POST = 'data:post',
  PUT = 'data:put',
  CREATE = 'data:create',
  DELETE = 'data:delete',
}
