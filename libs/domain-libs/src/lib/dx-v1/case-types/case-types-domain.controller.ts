import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Observable } from 'rxjs';

import {
  CaseTypeActionsVm,
  CaseTypeResponseVm,
  CaseTypeVm,
  CaseTypesVm,
  PSCASE_TYPES,
} from '@neom/models';
import { CaseTypesDomainService } from './case-types-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('case-types')
@ApiTags('case-types')
export class CaseTypesDomainController {
  constructor(
    private readonly _caseTypesDomainService: CaseTypesDomainService
  ) {}
  @MessagePattern(PSCASE_TYPES.GET)
  getCaseTypes({ headers }: any): Observable<CaseTypeResponseVm> {
    return this._caseTypesDomainService.getCaseTypes(headers);
  }
  @MessagePattern(PSCASE_TYPES.GETONE)
  getCaseTypeById(payload: any): Observable<CaseTypeVm> {
    return this._caseTypesDomainService.getCaseTypeById(payload);
  }
  @MessagePattern(PSCASE_TYPES.GETCASETYPEACTIONS)
  getCaseTypeActions(payload: any): Observable<CaseTypeActionsVm> {
    return this._caseTypesDomainService.getCaseTypeActions(payload);
  }
}
