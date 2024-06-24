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
// @CustomizeLogInterceptor({module: 'Data'})
export class DataDomainController {
  constructor(private readonly _dataDomainService: DataDomainService) {}

  @MessagePattern(PSDATA.GETDATAOBJECTS)
  getDataObjects(payload: any): Observable<any> {
    return this._dataDomainService.getDataObjects(payload);
  }
  @MessagePattern(PSDATA.GETDATAPAGES)
  getDataPages(payload: any): Observable<any> {
    return this._dataDomainService.getDataPages(payload);
  }
  @MessagePattern(PSDATA.GETDATAPAGEVIEWS)
  getDataPageView(payload: any): Observable<any> {
    return this._dataDomainService.getDataPageView(payload);
  }
  @MessagePattern(PSDATA.GETDATAPAGEVIEWMETADATA)
  getDataPageViewMetaData(payload: any): Observable<any> {
    return this._dataDomainService.getDataPageViewMetaData(payload);
  }
}
