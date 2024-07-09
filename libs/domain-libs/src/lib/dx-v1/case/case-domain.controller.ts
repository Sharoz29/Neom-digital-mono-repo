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
import { environment } from '@neom/shared/lib/environments/dev';
import axios from 'axios';

@Controller('case')
@ApiTags('case')
export class CaseDomainController {
  constructor(private readonly _caseDomainService: CaseDomainService) {}

  @MessagePattern(PSCASE.GET)
  getCases({ headers }: any): Observable<any> {
    return this._caseDomainService.getCases(headers);
  }

  @MessagePattern(PSCASE.GETONE)
  getCaseById(payload: any): Observable<any> {
    return this._caseDomainService.getCaseById(payload);
  }

  @MessagePattern(PSCASE.GETACTIONS)
  getCaseActions(payload: any): Observable<any> {
    return this._caseDomainService.getCaseActions(payload);
  }
  @MessagePattern(PSCASE.GETPAGE)
  getCasePage(payload: any): Observable<any> {
    return this._caseDomainService.getCasePage(payload);
  }
  @MessagePattern(PSCASE.GETVIEW)
  getCaseView(payload: any): Observable<any> {
    return this._caseDomainService.getCaseView(payload);
  }
}
