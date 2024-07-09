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

/**
 * Controller for handling data endpoints sedning request to the v2 pega api.
 */
@Controller('v2/data')
@ApiTags('data')
export class DataApiController {
  /**
   * Constructor to inject the DataApiService.
   * @param _dataApiService The service to handle data operations.
   */
  constructor(private readonly _dataApiService: DataApiService) {}

  /**
   * Gets the data objects
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/data_objects')
  @ApiOkResponse({
    description: 'Successfully retrieved the data objects.',
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
    summary: 'Gets the data objects',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getDataObjects(@Request() req: Request): Observable<any> {
    return this._dataApiService.getDataObjects(req);
  }
  /**
   * Gets the data pages
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/data_pages')
  @ApiOkResponse({
    description: 'Successfully retrieved the data pages.',
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
    summary: 'Gets the data pages',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getDataPages(@Request() req: Request): Observable<any> {
    return this._dataApiService.getDataPages(req);
  }

  /**
   * Gets the views of specified data page
   *
   * @param {string} id - The data id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/data_views/:id')
  @ApiOkResponse({
    description: 'Successfully retrieved the specified view of data page.',
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
    summary: 'Gets the views of specified data page',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getDataPageView(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._dataApiService.getDataPageView(id, req);
  }
  /**
   * Gets the views of specified data page
   *
   * @param {string} id - The data id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/data_views/:id/metadata')
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
    summary: 'Gets the metadata of the views of specified data page',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getDataPageViewMetaData(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._dataApiService.getDataPageViewMetaData(id, req);
  }
}
