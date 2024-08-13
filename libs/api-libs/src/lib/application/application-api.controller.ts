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
  ApiOperation,
} from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { ApplicationVm, PSAPPLICATION } from '@neom/models';
import { ApplicationApiService } from './application-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Controller for handling application endpoints to the pega api.
 */
@Controller('applications')
@ApiTags('applications')
export class ApplicationApiController {
  /**
   * Constructor to inject the ApplicationApiService.
   * @param _applicationApiService The service to handle application operations.
   */
  constructor(private readonly _applicationApiService: ApplicationApiService) {}

  /**
   * Gets all the applications.
   * @returns {Observable<any>} A the observable of type any.
   */
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all applications.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: The requested resource could not be found.',
  })
  @ApiOperation({ summary: 'Gets all applications' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getApplications(@Request() req: Request): Observable<any> {
    return this._applicationApiService.getApplications(req);
  }

  /**
   * Gets the applications version.
   * @returns {Observable<any>} A the observable of type any.
   */

  @Get('/version')
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the applications version.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: The requested resource could not be found.',
  })
  @ApiOperation({ summary: 'Gets the application version' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getApplicationVersion(@Request() req: Request): Observable<any> {
    return this._applicationApiService.getApplicationVersion(req);
  }
}
