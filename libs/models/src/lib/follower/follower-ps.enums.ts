/**
 * User PubSub Message Patterns
 */

export enum PSFOLLOWER {
  // CUSTOM
  GETCASEFOLLOWERS = 'follower:getCaseFollowers',
  // CRUD
  // Do not change the pattern below this line
  GET = 'follower:get',
  GETONE = 'follower:getOne',
  POST = 'follower:post',
  PUT = 'follower:put',
  CREATE = 'follower:create',
  DELETE = 'follower:delete',
}
