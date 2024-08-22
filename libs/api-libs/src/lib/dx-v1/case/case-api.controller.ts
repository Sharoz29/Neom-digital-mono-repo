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
  ApiOperation,
} from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { CaseVm, PSCASE } from '@neom/models';
import { CaseApiService } from './case-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Controller for handling cases endpoints sedning request to the v1 pega api.
 */
@Controller('v1/cases')
@ApiTags('case')
export class CaseApiController {
  /**
   * Constructor to inject the CaseApiService.
   * @param _caseApiService The service to handle cases operations.
   */
  constructor(private readonly _caseApiService: CaseApiService) {}

  /**
   * Gets all the cases.
   * @returns {Observable<any>} A the observable of type any.
   */
  @Get()
  @ApiOkResponse({
    description: 'Successfully retrieved all cases.',
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
    summary: 'Gets all the cases',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60)
  getCases(@Request() req: Request): Observable<any> {
    return this._caseApiService.getCases(req);
  }

  /**
   * Gets the case by the provided id
   *
   * @param {string} id - The case id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:id')
  @ApiOkResponse({
    description: 'Successfully retrieved the record for the specified case.',
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
    summary: 'Gets the case by the provided id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60)
  getCaseById(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._caseApiService.getCaseById(id, req);
  }

  /**
   * Gets the actions for the case by the provided case id and action id
   *
   * @param {string} caseId - The case id.
   * @param {string} actionId - The action id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId/actions/:actionId')
  @ApiOkResponse({
    description:
      'Successfully retrieved the record for the field types for the case.',
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
    summary:
      'Gets the fields for the case by the provided case id and action id',
  })
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(60 * 60 * 24)
  getCaseActions(
    @Param('caseInfoId') caseId: string,
    @Param('actionId') actionId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._caseApiService.getCaseActions(caseId, actionId, req);
  }

  /**
   * Gets the page for the case by the provided case id and page id
   *
   * @param {string} caseId - The case id.
   * @param {string} pageId - The page id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId/pages/:pageId')
  @ApiOkResponse({
    description: 'Successfully retrieved the record for the page for the case.',
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
    summary: 'Gets the page for the case by the provided case id and page id',
  })
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(60 * 60 * 24)
  getCasePage(
    @Param('caseInfoId') caseId: string,
    @Param('pageId') pageId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._caseApiService.getCasePage(caseId, pageId, req);
  }

  // Gets the view for the case by the provided case id and view id
  /**
   * Gets the view for the case by the provided case id and view id
   *
   * @param {string} caseId - The case id.
   * @param {string} viewId - The view id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId/views/:viewId')
  @ApiOkResponse({
    description: 'Successfully retrieved the record for the view for the case.',
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
    summary: 'Gets the page for the case by the provided case id and page id',
  })
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(60 * 60 * 24)
  getCaseView(
    @Param('caseId') caseId: string,
    @Param('viewId') viewId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._caseApiService.getCaseView(caseId, viewId, req);
  }
}
