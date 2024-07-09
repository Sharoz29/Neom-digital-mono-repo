import {
  Controller,
  Get,
  Param,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
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
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Controller for handling casetypes endpoints sedning request to the v2 pega api.
 */
@Controller('v2/casetypes')
@ApiTags('casetypes')
export class CaseTypesApiController {
  /**
   * Constructor to inject the CaseTypesApiService.
   * @param _caseTypesApiService The service to handle casetypes operations.
   */
  constructor(private readonly _caseTypesApiService: CaseTypesApiService) {}

  /**
   * Gets all the case types.
   * @returns {Observable<any>} A the observable of type any.
   */
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
  @CacheTTL(60 * 60 * 24)
  getCaseTypes(@Request() req: Request): Observable<any> {
    return this._caseTypesApiService.getCaseTypes(req);
  }

  /**
   * Gets the bulk action details for this casetype
   * @param {string} caseTypeId - The case id.
   * @param {string} actionId - The case id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseTypeId/actions/:actionId')
  @ApiOkResponse({
    description:
      'Successfully retrieved the action details for the specified case type.',
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
    summary: 'Gets the bulk action details for this casetype',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getCaseTypeActions(
    @Param('caseTypeId') caseTypeId: string,
    @Param('actionId') actionId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._caseTypesApiService.getCaseTypeActions(
      caseTypeId,
      actionId,
      req
    );
  }
}
