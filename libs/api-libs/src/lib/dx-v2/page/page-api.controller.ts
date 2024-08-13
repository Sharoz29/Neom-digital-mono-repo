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
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { PageVm, PSPAGE } from '@neom/models';
import { PageApiService } from './page-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Controller for handling page endpoints sending request to the v2 pega api.
 */
@Controller('v2/page')
@ApiTags('page')
export class PageApiController {
  /**
   * Constructor to inject the PageApiService.
   * @param _pageApiService The service to handle page operations.
   */
  constructor(private readonly _pageApiService: PageApiService) {}

  /**
   * Gets the channel by the provided id
   *
   * @param {string} channelId - The channel id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/channel/:channelId')
  @ApiOkResponse({
    description: 'Successfully retrieved the record for the specified channel.',
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
    summary: 'Gets the channel by the provided id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getChannelById(
    @Param('channelId') channelId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._pageApiService.getChannelById(channelId, req);
  }

  /**
   * Gets the dashboard by the provided id
   *
   * @param {string} dashboardId - The dashboard id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/dashboard/:dashboardId')
  @ApiOkResponse({
    description:
      'Successfully retrieved the record for the specified dashboard.',
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
    summary: 'Gets the dashboard by the provided id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getDashboardById(
    @Param('dashboardId') dashboardId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._pageApiService.getDashboardById(dashboardId, req);
  }

  /**
   * Gets the insight by the provided id
   *
   * @param {string} insightId - The insight id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/dashboard/:dashboardId')
  @ApiOkResponse({
    description: 'Successfully retrieved the record for the specified insight.',
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
    summary: 'Gets the insight by the provided id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getInsightById(
    @Param('insightId') insightId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._pageApiService.getInsightById(insightId, req);
  }
  /**
   * Gets the page by the provided id
   *
   * @param {string} pageId - The page id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:pageId')
  @ApiOkResponse({
    description: 'Successfully retrieved the record for the specified page.',
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
    summary: 'Gets the insight by the provided id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getPageById(
    @Param('pageId') pageId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._pageApiService.getPageById(pageId, req);
  }
  /**
   * Gets the portal by the provided id
   *
   * @param {string} portalId - The portal id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/portal/:portalId')
  @ApiOkResponse({
    description: 'Successfully retrieved the record for the specified portal.',
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
    summary: 'Gets the insight by the provided id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getPortalById(
    @Param('portalId') portalId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._pageApiService.getPortalById(portalId, req);
  }
}
