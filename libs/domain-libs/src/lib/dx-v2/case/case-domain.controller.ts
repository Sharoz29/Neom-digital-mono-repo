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

import { CaseVm, PSCASE } from '@neom/models';
import { CaseDomainService } from './case-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('case')
@ApiTags('case')
// @CustomizeLogInterceptor({module: 'Case'})
export class CaseDomainController {
  constructor(private readonly _caseDomainService: CaseDomainService) {}

  @MessagePattern(PSCASE.GETONE)
  getCaseById(payload: any): Observable<any> {
    return this._caseDomainService.getCaseById(payload);
  }
  @MessagePattern(PSCASE.GETANCESTORS)
  getCaseAncestors(payload: any): Observable<any> {
    return this._caseDomainService.getCaseAncestors(payload);
  }
  @MessagePattern(PSCASE.GETDESCENDANTS)
  getCaseDescendants(payload: any): Observable<any> {
    return this._caseDomainService.getCaseDescendants(payload);
  }
  @MessagePattern(PSCASE.GETSTAGES)
  getCaseStages(payload: any): Observable<any> {
    return this._caseDomainService.getCaseStages(payload);
  }
  @MessagePattern(PSCASE.GETACTIONS)
  getCaseActions(payload: any): Observable<any> {
    return this._caseDomainService.getCaseActions(payload);
  }
  @MessagePattern(PSCASE.GETVIEW)
  getCaseView(payload: any): Observable<any> {
    return this._caseDomainService.getCaseView(payload);
  }
}
