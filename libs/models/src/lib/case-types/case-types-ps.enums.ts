/**
 * User PubSub Message Patterns
 */

export enum PSCASE_TYPES {
  // CUSTOM
  GETCREATIONPAGEV1 = 'caseTypes:getCreationPageV1',
  GETCASETYPEACTIONSV1 = 'caseTypes:getCaseTypeActionsV1',

  GETCREATIONPAGEV2 = 'caseTypes:getCreationPageV2',
  GETCASETYPEACTIONSV2 = 'caseTypes:getCaseTypeActionsV2',
  // CRUD
  // Do not change the pattern below this line
  GETV1 = 'caseTypes:getV1',
  GETV2 = 'caseTypes:getV2',

  GETONEV1 = 'caseTypes:getOneV1',
  GETONEV2 = 'caseTypes:getOneV2',

  POST = 'caseTypes:post',
  PUT = 'caseTypes:put',
  CREATE = 'caseTypes:create',
  DELETE = 'caseTypes:delete',

  POSTV2 = 'caseTypes:postv2',
  PUTV2 = 'caseTypes:putv2',
  CREATEV2 = 'caseTypes:createv2',
  DELETEV2 = 'caseTypes:deletev2',
}
