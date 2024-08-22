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

  POSTV1 = 'caseTypes:postV1',
  POSTV2 = 'caseTypes:postV2',

  PUTV1 = 'caseTypes:putV1',
  PUTV2 = 'caseTypes:putV2',

  CREATEV1 = 'caseTypes:createV1',
  CREATEV2 = 'caseTypes:createV2',

  DELETEV1 = 'caseTypes:deleteV1',
  DELETEV2 = 'caseTypes:deleteV2',
}
