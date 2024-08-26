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

import { RelatedCaseVm, PSRELATED_CASE } from '@neom/models';
import { RelatedCaseDomainService } from './related-case-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('related-case')
@ApiTags('related-case')
export class RelatedCaseDomainController {
  constructor(
    private readonly _relatedCaseDomainService: RelatedCaseDomainService
  ) {}

  @MessagePattern(PSRELATED_CASE.GETONEV2)
  getRelatedCases(payload: any): Observable<any> {
    return this._relatedCaseDomainService.getRelatedCases(payload);
  }
}
