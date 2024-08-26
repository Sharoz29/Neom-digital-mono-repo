/**
 * User PubSub Message Patterns
 */

export enum PSDATA {
  // CUSTOM
  GETMETADATAV1 = 'data:getMetaDataV1',
  GETMETADATAV2 = 'data:getMetaDataV2',

  GETDATAOBJECTSV1 = 'data:getDataObjectsV1',
  GETDATAOBJECTSV2 = 'data:getDataObjectsV2',

  GETDATAPAGESV1 = 'data:getDataPagesV1',
  GETDATAPAGESV2 = 'data:getDataPagesV2',

  GETDATAPAGEVIEWSV1 = 'data:getDataPageViewsV1',
  GETDATAPAGEVIEWSV2 = 'data:getDataPageViewsV2',

  GETDATAPAGEVIEWMETADATAV1 = 'data:getDataPageViewMetaDataV1',
  GETDATAPAGEVIEWMETADATAV2 = 'data:getDataPageViewMetaDataV2',

  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'data:getV1',
  GETV2 = 'data:getV2',

  GETONEV1 = 'data:getOneV1',
  GETONEV2 = 'data:getOneV2',

  POSTV1 = 'data:postV1',
  POSTV2 = 'data:postV2',

  PUTV1 = 'data:putV1',
  PUTV2 = 'data:putV2',

  CREATEV1 = 'data:createV1',
  CREATEV2 = 'data:createV2',

  DELETEV1 = 'data:deleteV1',
  DELETEV2 = 'data:deleteV2',
}
