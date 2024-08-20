/**
 * User PubSub Message Patterns
 */

export enum PSCASE_TYPES {
  // CUSTOM
  GETCREATIONPAGE = 'caseTypes:getCreationPage',
  GETCASETYPEACTIONS = 'caseTypes:getCaseTypeActions',
  GETCREATIONPAGEV2 = 'caseTypes:getCreationPagev2',
  GETCASETYPEACTIONSV2 = 'caseTypes:getCaseTypeActionsv2',
  // CRUD
  // Do not change the pattern below this line
  GET = 'caseTypes:get',
  GETONE = 'caseTypes:getOne',
  POST = 'caseTypes:post',
  PUT = 'caseTypes:put',
  CREATE = 'caseTypes:create',
  DELETE = 'caseTypes:delete',
  
  GETV2 = 'caseTypes:getv2',
  GETONEV2 = 'caseTypes:getOnev2',
  POSTV2 = 'caseTypes:postv2',
  PUTV2 = 'caseTypes:putv2',
  CREATEV2 = 'caseTypes:createv2',
  DELETEV2 = 'caseTypes:deletev2',
}
