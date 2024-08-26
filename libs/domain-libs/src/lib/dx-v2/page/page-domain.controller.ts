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

import { PageVm, PSPAGE } from '@neom/models';
import { PageDomainService } from './page-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('page')
@ApiTags('page')
// @CustomizeLogInterceptor({module: 'Page'})
export class PageDomainController {
  constructor(private readonly _pageDomainService: PageDomainService) {}

  @MessagePattern(PSPAGE.GETCHANNELV2)
  getChannelById(payload: any): Observable<any> {
    return this._pageDomainService.getChannelById(payload);
  }
  @MessagePattern(PSPAGE.GETDASHBOARDV2)
  getDashboardById(payload: any): Observable<any> {
    return this._pageDomainService.getDashboardById(payload);
  }
  @MessagePattern(PSPAGE.GETINSIGHTV2)
  getInsightById(payload: any): Observable<any> {
    return this._pageDomainService.getInsightById(payload);
  }
  @MessagePattern(PSPAGE.GETONEV2)
  getPageById(payload: any): Observable<any> {
    return this._pageDomainService.getPageById(payload);
  }
  @MessagePattern(PSPAGE.GETPORTALV2)
  getPortalById(payload: any): Observable<any> {
    return this._pageDomainService.getPortalById(payload);
  }
}
