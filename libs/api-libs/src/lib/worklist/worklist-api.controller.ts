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
  UseInterceptors,
  Request,
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

import { WorklistVm, PSWORKLIST } from '@neom/models';
import { WorklistApiService } from './worklist-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('data')
@ApiTags('Data Controller')
// @CustomizeLogInterceptor({module: 'Worklist'})
export class WorklistApiController {
  constructor(private readonly _worklistApiService: WorklistApiService) {}

  @Get("/:id")
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
  @CacheTTL(60 * 60 * 24)
  async getWorklist(@Param("id") param: string, @Request() req: Request) {
        return this._worklistApiService.getWorklist(param, req);

  }
}
