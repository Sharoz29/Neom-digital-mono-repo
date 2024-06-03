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
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiParam,
  ApiBody,
  ApiTags,
  ApiResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBadGatewayResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { OperatorIdVm, PSOPERATOR_ID } from '@neom/models';
import { OperatorIdApiService } from './operator-id-api.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('data/D_OperatorID')
@ApiTags('operator-id')
// @CustomizeLogInterceptor({module: 'OperatorId'})
export class OperatorIdApiController {
  constructor(private readonly _operatorIdApiService: OperatorIdApiService) {}

  @Get()
  @ApiOkResponse({
    description:
      'Successfully retrieved the record for the specified worklist.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiBadGatewayResponse({
    description: 'Bad Gateway',
  })
  @ApiNotFoundResponse({
    description: 'Not Found: The requested resource could not be found.',
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authorized to view these resources.',
  })
  @UseInterceptors(CacheInterceptor)
  async getWorklist(@Request() req: Request) {
    return this._operatorIdApiService.getOperatorID(req);
  }
}
