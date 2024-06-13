/**
 * User PubSub Message Patterns
 */

export enum PSCASE_TYPES {
  // CUSTOM
  GETCREATIONPAGE = 'caseTypes:getCreationPage',
  GETCASETYPEACTIONS = 'caseTypes:getCaseTypeActions',
  // CRUD
  // Do not change the pattern below this line
  GET = 'caseTypes:get',
  GETONE = 'caseTypes:getOne',
  POST = 'caseTypes:post',
  PUT = 'caseTypes:put',
  CREATE = 'caseTypes:create',
  DELETE = 'caseTypes:delete',
}
