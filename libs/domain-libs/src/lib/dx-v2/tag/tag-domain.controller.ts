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

import { TagVm, PSTAG } from '@neom/models';
import { TagDomainService } from './tag-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('tag')
@ApiTags('tag')
// @CustomizeLogInterceptor({module: 'Tag'})
export class TagDomainController {
  constructor(private readonly _tagDomainService: TagDomainService) {}
  @MessagePattern(PSTAG.GETONEV2)
  getCaseTags(payload: any): Observable<any> {
    return this._tagDomainService.getCaseTags(payload);
  }
}
