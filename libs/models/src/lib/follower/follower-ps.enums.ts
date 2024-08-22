/**
 * User PubSub Message Patterns
 */

export enum PSFOLLOWER {
  // CUSTOM
  GETCASEFOLLOWERSV1 = 'follower:getCaseFollowersV1',
  GETCASEFOLLOWERSV2 = 'follower:getCaseFollowersV2',
  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'follower:getV1',
  GETV2 = 'follower:getV2',

  GETONEV1 = 'follower:getOneV1',
  GETONEV2 = 'follower:getOneV2',

  POSTV1 = 'follower:postV1',
  POSTV2 = 'follower:postV2',

  PUTV1 = 'follower:putV1',
  PUTV2 = 'follower:putV2',

  CREATEV1 = 'follower:createV1',
  CREATEV2 = 'follower:createV2',

  DELETEV1 = 'follower:deleteV1',
  DELETEV2 = 'follower:deleteV2',
}
