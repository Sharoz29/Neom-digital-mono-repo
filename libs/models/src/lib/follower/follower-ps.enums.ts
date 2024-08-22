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

  POST = 'follower:post',
  PUT = 'follower:put',
  CREATE = 'follower:create',
  DELETE = 'follower:delete',
}
