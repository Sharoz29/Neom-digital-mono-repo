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
  async getCases({ headers }: any) {
    return this._caseDomainService.getCases(headers);
  }

  @MessagePattern(PSCASE.GETONE)
  async getCaseById(payload: any) {
    return this._caseDomainService.getCaseById(payload);
  }
  @MessagePattern(PSCASE.GETATTACHMENTS)
  async getCaseAttachments(payload: any) {
    this._caseDomainService.getCaseAttachments(payload);
  }

  @MessagePattern(PSCASE.GETFIELDS)
  async getFieldsForCase(payload: any) {
    return this._caseDomainService.getFieldsForCase(payload);
  }
  @MessagePattern(PSCASE.GETPAGE)
  async getCasePage(payload: any) {
    this._caseDomainService.getCasePage(payload);
  }
  @MessagePattern(PSCASE.GETVIEW)
  async getCaseView(payload: any) {
    return this._caseDomainService.getCaseView(payload);
  }
}
