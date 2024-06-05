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
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('casetypes')
@ApiTags('casetypes')
// @CustomizeLogInterceptor({module: 'CaseTypes'})
export class CaseTypesApiController {
  constructor(private readonly _caseTypesApiService: CaseTypesApiService) {}

  // Gets all the case types
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
  @ApiOperation({
    summary: 'Gets all the casetypes',
  })
  @UseInterceptors(CacheInterceptor)
  async getCaseTypes(@Request() req: Request) {
    return this._caseTypesApiService.getCaseTypes(req);
  }

  // Gets the creation page for cases
  @Get('/:id')
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
  @ApiOperation({
    summary: 'Gets the creation page of the case by the specified id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  async getCaseCreationPage(
    @Param('id') param: string,
    @Request() req: Request
  ) {
    return this._caseTypesApiService.getCaseCreationPage(param, req);
  }
}
