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

  POST = 'page:post',
  PUT = 'page:put',
  CREATE = 'page:create',
  DELETE = 'page:delete',
}
