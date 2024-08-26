/**
 * User PubSub Message Patterns
 */

export enum PSPAGE {
  // CUSTOM
  GETCHANNELV1 = 'page:getChannelV1',
  GETCHANNELV2 = 'page:getChannelV2',

  GETDASHBOARDV1 = 'page:getDashboardV1',
  GETDASHBOARDV2 = 'page:getDashboardV2',

  GETINSIGHTV1 = 'page:getInsightV1',
  GETINSIGHTV2 = 'page:getInsightV2',

  GETPORTALV1 = 'page:getPortalV1',
  GETPORTALV2 = 'page:getPortalV2',

  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'page:getV1',
  GETV2 = 'page:getV2',

  GETONEV1 = 'page:getOneV1',
  GETONEV2 = 'page:getOneV2',

  POSTV1 = 'page:postV1',
  POSTV2 = 'page:postV2',

  PUTV1 = 'page:putV1',
  PUTV2 = 'page:putV2',

  CREATEV1 = 'page:createV1',
  CREATEV2 = 'page:createV2',

  DELETEV1 = 'page:deleteV1',
  DELETEV2 = 'page:deleteV2',
}
