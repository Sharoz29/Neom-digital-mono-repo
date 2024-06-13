import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { BaseModelVm } from '../base.modelvm';

export class CaseTypesVm extends BaseModelVm {
  @ApiProperty()
  name!: string;

  // Create and add more VmModel Properties below:
  // !Note that if you want to map a different name of property in Vm from the Model
  // !Then use the mapper service to implement the custom mapping.

  // Model Getters and Setters
}

export class CaseTypesCreateVm extends OmitType(CaseTypesVm, [
  'createdAt',
  'updatedAt',
  'id',
]) {}

export class CaseTypeLinksVm {
  @ApiProperty()
  pzInsKey!: string;
  @ApiProperty()
  pyPurpose!: string;
  @ApiProperty()
  href!: string;
  @ApiProperty()
  rel!: string;
  @ApiProperty()
  request_body!: any;
  @ApiProperty()
  title!: string;
  @ApiProperty()
  type!: string;
}

export class CaseTypeVm {
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  pzInsKey!: string;
  @ApiProperty()
  links!: CaseTypeLinksVm;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  pyPurpose!: string;
}

export class CaseTypeResponseVm {
  @ApiProperty()
  applicationIsConstellationCompatible!: boolean;
  @ApiProperty()
  caseTypes!: CaseTypeVm[];
  @ApiProperty()
  pzInsKey!: string;
  @ApiProperty()
  pyPurpose!: string;
}

export class SlaVm {
  @ApiProperty()
  deadline!: string;
  @ApiProperty()
  goal!: string;
}
export class CaseTypeStageProcessVm {
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  sla!: SlaVm;
}
export class CaseTypeStageVm {
  @ApiProperty()
  entryTime!: string;
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  links!: any;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  processes!: CaseTypeStageProcessVm[];
  @ApiProperty()
  sla!: SlaVm;
  @ApiProperty()
  type!: string;
  @ApiProperty()
  visited_status!: string;
  @ApiProperty()
  transitionType!: string;
}
export class CaseTypeParticipant {
  @ApiProperty()
  city!: string;
  @ApiProperty()
  country!: string;
  @ApiProperty()
  email!: string;
  @ApiProperty()
  firstName!: string;
  @ApiProperty()
  fullName!: string;
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  lastName!: string;
  @ApiProperty()
  phone!: string;
  @ApiProperty()
  postalCode!: string;
  @ApiProperty()
  role!: string;
  @ApiProperty()
  state!: string;
}
export class CaseTypeAssociationsVm {
  @ApiProperty()
  follows!: boolean;
}
export class RelatedCaseTypeVm {
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  name!: string;
}
export class CaseTypeParentCaseContentVm {
  @ApiProperty()
  pxUrgencyWork!: number;
  @ApiProperty()
  pyStatusWork!: string;
  @ApiProperty()
  pxCreateOperatorAndDateTime!: string;
  @ApiProperty()
  pxUpdatedOperatorAndDateTime!: string;
}
export class CaseTypeAssigneeInfoVm {
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  type!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  image!: string;
}
export class CaseTypeActionVm {
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  type!: string;
  @ApiProperty()
  links!: any;
}

export class CaseTypeAssignmentVm {
  @ApiProperty()
  assigneeInfo!: CaseTypeAssigneeInfoVm;
  @ApiProperty()
  instructions!: string;
  @ApiProperty()
  urgency!: number;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  canPerform!: boolean;
  @ApiProperty()
  context!: string;
  @ApiProperty()
  processID!: string;
  @ApiProperty()
  processName!: string;
  @ApiProperty()
  isMultiStep!: string;
  @ApiProperty()
  actions!: CaseTypeActionVm[];
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  links!: any;
  @ApiProperty()
  sla!: SlaVm;
}
export class CaseTypeChildCaseVm {
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  assignments!: CaseTypeAssignmentVm[];
  @ApiProperty()
  links!: any;
}
export class CaseTypeAvailableProcessVm {
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  type!: string;
  @ApiProperty()
  links!: any;
}
export class CaseTypeAvailableActionVm {
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  type!: string;
  @ApiProperty()
  links!: any;
}
export class CaseTypeParentCaseInfoVm {
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  hasMoreAncestors!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  content!: CaseTypeParentCaseContentVm;
  @ApiProperty()
  links!: any;
}

export class CaseTypeActionsVm {
  @ApiProperty()
  assignments!: CaseTypeAssignmentVm[];
  @ApiProperty()
  availableActions!: CaseTypeAvailableActionVm[];
  @ApiProperty()
  availableProcesses!: CaseTypeAvailableProcessVm[];
  @ApiProperty()
  childCases!: CaseTypeChildCaseVm[];
  @ApiProperty()
  parentCaseInfo!: CaseTypeParentCaseInfoVm;
  @ApiProperty()
  caseTypeID!: string;
  @ApiProperty()
  businessID!: string;
  @ApiProperty()
  content!: CaseTypeParentCaseContentVm;
  @ApiProperty()
  relatedCaseTypes!: RelatedCaseTypeVm[];
  @ApiProperty()
  associations!: CaseTypeAssociationsVm;
  @ApiProperty()
  createTime!: string;
  @ApiProperty()
  createdBy!: string;
  @ApiProperty()
  ID!: string;
  @ApiProperty()
  lastUpdateTime!: string;
  @ApiProperty()
  lastUpdatedBy!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  owner!: string;
  @ApiProperty()
  participants!: CaseTypeParticipant[];
  @ApiProperty()
  sla!: SlaVm;
  @ApiProperty()
  stageID!: string;
  @ApiProperty()
  stageLabel!: string;
  @ApiProperty()
  stages!: CaseTypeStageVm[];
  @ApiProperty()
  status!: string;
  @ApiProperty()
  urgency!: string;
}
