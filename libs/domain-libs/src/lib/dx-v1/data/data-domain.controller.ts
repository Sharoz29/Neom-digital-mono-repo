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

import { DataVm, PSDATA } from '@neom/models';
import { DataDomainService } from './data-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('data')
@ApiTags('data')
export class DataDomainController {
  constructor(private readonly _dataDomainService: DataDomainService) {}

  @MessagePattern(PSDATA.GETV1)
  getData(payload: any): Observable<any> {
    return this._dataDomainService.getData(payload);
  }
  @MessagePattern(PSDATA.GETMETADATAV1)
  getDataMetaData(payload: any): Observable<any> {
    return this._dataDomainService.getDataMetaData(payload);
  }
}
