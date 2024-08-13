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

import { ApplicationVm, PSAPPLICATION } from '@neom/models';
import { ApplicationDomainService } from './application-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('application')
@ApiTags('application')
// @CustomizeLogInterceptor({module: 'Application'})
export class ApplicationDomainController {
  constructor(
    private readonly _applicationDomainService: ApplicationDomainService
  ) {}
  @MessagePattern(PSAPPLICATION.GET)
  getApplications(payload: any): Observable<any> {
    return this._applicationDomainService.getApplications(payload);
  }

  @MessagePattern(PSAPPLICATION.GETVERSION)
  getApplicationVersion(payload: any) {
    return this._applicationDomainService.getApplicationVersion(payload);
  }
}
