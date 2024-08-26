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

  @MessagePattern(PSDATA.GETDATAOBJECTSV2)
  getDataObjects(payload: any): Observable<any> {
    return this._dataDomainService.getDataObjects(payload);
  }
  @MessagePattern(PSDATA.GETDATAPAGESV2)
  getDataPages(payload: any): Observable<any> {
    return this._dataDomainService.getDataPages(payload);
  }
  @MessagePattern(PSDATA.GETDATAPAGEVIEWSV2)
  getDataPageView(payload: any): Observable<any> {
    return this._dataDomainService.getDataPageView(payload);
  }
  @MessagePattern(PSDATA.GETDATAPAGEVIEWMETADATAV2)
  getDataPageViewMetaData(payload: any): Observable<any> {
    return this._dataDomainService.getDataPageViewMetaData(payload);
  }
}
