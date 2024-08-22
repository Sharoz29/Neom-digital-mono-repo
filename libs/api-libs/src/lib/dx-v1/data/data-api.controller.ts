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
  Query,
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

import { catchError, defaultIfEmpty, EMPTY, map, Observable, of, throwIfEmpty } from 'rxjs';

import { DataVm, PSDATA } from '@neom/models';
import { DataApiService } from './data-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CustomCacheInterceptor } from '@neom/nst-libs/lib/interceptors/custom-cache.interceptor';

/**
 * Controller for handling data endpoints sedning request to the v1 pega api.
 */
@Controller('v1/data')
@ApiTags('data')
export class DataApiController {
  /**
   * Constructor to inject the DataApiService.
   * @param _dataApiService The service to handle cases operations.
   */
  constructor(private readonly _dataApiService: DataApiService) {}

  /**
   * Gets the data by the provided id
   *
   * @param {string} id - The data id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
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
  @UseInterceptors(CustomCacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getData(
    @Param('id') id: string,
    @Request() req: Request,
    @Query() query: any
  ): Observable<any> {
    return this._dataApiService.getData(id, req, query)
    .pipe(
      defaultIfEmpty({ pxResults: [] }),
      map((response) => {
        if (!query?.$f) return response;
        const columns = query.$f?.split(',');
        if (columns?.length <= 0) return response;

        const { pxResults } = response;

        if (pxResults && pxResults.length > 0) {
          return {
            pxResults: pxResults.map((result: Record<string, any>) =>
              columns.reduce((pre: object, cur: string, index: number) => {
                return { ...pre, [cur]: result[cur] };
              }, {}) || []
            ),
          };
        }
      }),
      catchError((error) => {
        return of({});
      })
    );
  }
  //Get data metadata
  /**
   * Gets the data metadata by the provided id
   *
   * @param {string} id - The data id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:id/metadata')
  @ApiOkResponse({
    description:
      'Successfully retrieved the metadata of the specified data view using the id.',
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
    summary: 'Gets the metadata of a data view given its name',
  })
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(60 * 60 * 24)
  getDataMetaData(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._dataApiService.getDataMetaData(id, req);
  }
}
