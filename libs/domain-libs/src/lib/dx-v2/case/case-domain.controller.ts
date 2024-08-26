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

  @MessagePattern(PSCASE.GETONEV2)
  getCaseById(payload: any): Observable<any> {
    return this._caseDomainService.getCaseById(payload);
  }
  @MessagePattern(PSCASE.GETANCESTORSV2)
  getCaseAncestors(payload: any): Observable<any> {
    return this._caseDomainService.getCaseAncestors(payload);
  }
  @MessagePattern(PSCASE.GETDESCENDANTSV2)
  getCaseDescendants(payload: any): Observable<any> {
    return this._caseDomainService.getCaseDescendants(payload);
  }
  @MessagePattern(PSCASE.GETSTAGESV2)
  getCaseStages(payload: any): Observable<any> {
    return this._caseDomainService.getCaseStages(payload);
  }
  @MessagePattern(PSCASE.GETACTIONSV2)
  getCaseActions(payload: any): Observable<any> {
    return this._caseDomainService.getCaseActions(payload);
  }
  @MessagePattern(PSCASE.GETVIEWV2)
  getCaseView(payload: any): Observable<any> {
    return this._caseDomainService.getCaseView(payload);
  }
}
