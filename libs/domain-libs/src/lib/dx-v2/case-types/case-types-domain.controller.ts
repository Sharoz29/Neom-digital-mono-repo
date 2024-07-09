import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiParam,
  ApiBody,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { CaseTypesVm, PSCASE_TYPES } from '@neom/models';
import { CaseTypesDomainService } from './case-types-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('case-types')
@ApiTags('case-types')
// @CustomizeLogInterceptor({module: 'CaseTypes'})
export class CaseTypesDomainController {
  constructor(
    private readonly _caseTypesDomainService: CaseTypesDomainService
  ) {}
  @MessagePattern(PSCASE_TYPES.GET)
  getCaseTypes({ headers }: any): Observable<any> {
    return this._caseTypesDomainService.getCaseTypes(headers);
  }
  @MessagePattern(PSCASE_TYPES.GETCASETYPEACTIONS)
  getCaseTypeActions(payload: any): Observable<any> {
    return this._caseTypesDomainService.getCaseTypeActions(payload);
  }
}
