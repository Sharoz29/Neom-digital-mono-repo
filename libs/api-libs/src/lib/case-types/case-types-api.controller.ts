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
  Inject,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiParam,
  ApiBody,
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBadGatewayResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { CaseTypesVm, PSCASE_TYPES } from '@neom/models';
import { CaseTypesApiService } from './case-types-api.service';
import { ClientProxy } from '@nestjs/microservices';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('casetypes')
@ApiTags('casetypes')
// @CustomizeLogInterceptor({module: 'CaseTypes'})
export class CaseTypesApiController {
  constructor(private readonly _caseTypesApiService: CaseTypesApiService) {}

  @Get()
  @ApiOkResponse({
    description:
      'Successfully retrieved the record for the specified case types.',
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
  async getCaseTypes(@Request() req: Request) {
    return this._caseTypesApiService.getCaseTypes(req);
  }
}
