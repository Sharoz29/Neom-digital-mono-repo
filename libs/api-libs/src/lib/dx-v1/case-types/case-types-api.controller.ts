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

import {
  CaseTypeActionsVm,
  CaseTypeResponseVm,
  CaseTypeVm,
} from '@neom/models';
import { CaseTypesApiService } from './case-types-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Controller for handling casetypes endpoints sedning request to the v1 pega api.
 */
@Controller('v1/casetypes')
@ApiTags('casetypes')
export class CaseTypesApiController {
  /**
   * Constructor to inject the CaseTypesApiService.
   * @param _caseTypesApiService The service to handle cases operations.
   */
  constructor(private readonly _caseTypesApiService: CaseTypesApiService) {}

  /**
   * Gets all the case types.
   * @returns {Observable<CaseTypeResponseVm>} A the observable of type CaseTypeResponseVm.
   */
  @Get()
  @ApiOkResponse({
    type: CaseTypeResponseVm,
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
  @CacheTTL(60 * 60)
  getCaseTypes(@Request() req: Request): Observable<CaseTypeResponseVm> {
    return this._caseTypesApiService.getCaseTypes(req);
  }

  /**
   * Gets the case type by the provided id
   *
   * @param {string} id - The case id.
   * @returns {Observable<CaseTypeVm>} A the observable of type CaseTypeVm.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:id')
  @ApiOkResponse({
    type: CaseTypeVm,
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
  getCaseTypeById(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<CaseTypeVm> {
    return this._caseTypesApiService.getCaseTypeById(id, req);
  }
}
