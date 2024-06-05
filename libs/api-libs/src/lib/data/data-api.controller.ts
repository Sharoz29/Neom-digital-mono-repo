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
  ApiOperation,
} from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { DataVm, PSDATA } from '@neom/models';
import { DataApiService } from './data-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('data')
@ApiTags('data')
export class DataApiController {
  constructor(private readonly _dataApiService: DataApiService) {}

  // Gets the data by the provided id
  @Get('/:id')
  @ApiOkResponse({
    description:
      'Successfully retrieved the specified data dynamically using the id.',
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
    summary: 'Gets the data by the provided id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  async getData(@Param('id') param: string, @Request() req: Request) {
    return this._dataApiService.getData(param, req);
  }
}
