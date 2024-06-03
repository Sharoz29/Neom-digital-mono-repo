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

import { OperatorIdVm, PSOPERATOR_ID } from '@neom/models';
import { OperatorIdDomainService } from './operator-id-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('operator-id')
@ApiTags('operator-id')
// @CustomizeLogInterceptor({module: 'OperatorId'})
export class OperatorIdDomainController {
  constructor(
    private readonly _operatorIdDomainService: OperatorIdDomainService
  ) {}

  @MessagePattern(PSOPERATOR_ID.GET)
  async getCaseTypes({ headers }: any) {
    return this._operatorIdDomainService.getOperatorId(headers);
  }
}
