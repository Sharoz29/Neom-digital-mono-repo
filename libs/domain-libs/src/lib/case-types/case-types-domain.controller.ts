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
export class CaseTypesDomainController {
  constructor(
    private readonly _caseTypesDomainService: CaseTypesDomainService
  ) {}
  @MessagePattern(PSCASE_TYPES.GET)
  async getCaseTypes({ headers }: any) {
    return this._caseTypesDomainService.getCaseTypes(headers);
  }
  @MessagePattern(PSCASE_TYPES.GETCREATIONPAGE)
  async getCaseCreationPage(payload: any) {
    return this._caseTypesDomainService.getCaseCreationPage(payload);
  }
}
