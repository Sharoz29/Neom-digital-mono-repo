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

  @MessagePattern(PSDATA.GET)
  async getCaseTypes(payload: any) {
    return this._dataDomainService.getData(payload);
  }
}
