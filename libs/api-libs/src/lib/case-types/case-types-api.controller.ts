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

@Controller('casetypes')
@ApiTags('casetypes')
// @CustomizeLogInterceptor({module: 'CaseTypes'})
export class CaseTypesApiController {
  constructor(private readonly _caseTypesApiService: CaseTypesApiService) {}

  // Gets all the case types
  @Get()
  @ApiOkResponse({
    type: Observable<CaseTypeResponseVm>,
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
  getCaseTypes(@Request() req: Request): Observable<CaseTypeResponseVm> {
    return this._caseTypesApiService.getCaseTypes(req);
  }

  // Gets the creation page for cases
  @Get('/:id')
  @ApiOkResponse({
    type: Observable<CaseTypeVm>,
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
  getCaseCreationPage(
    @Param('id') param: string,
    @Request() req: Request
  ): Observable<CaseTypeVm> {
    return this._caseTypesApiService.getCaseCreationPage(param, req);
  }

  //Gets the bulk action details for this casetype
  @Get('/:caseTypeId/actions/:actionId')
  @ApiOkResponse({
    type: Observable<CaseTypeActionsVm>,
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
    summary: 'Gets the creation page of the case by the specified id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getCaseTypeActions(
    @Param('caseTypeId') caseTypeId: string,
    @Param('actionId') actionId: string,
    @Request() req: Request
  ): Observable<CaseTypeActionsVm> {
    return this._caseTypesApiService.getCaseTypeActions(
      caseTypeId,
      actionId,
      req
    );
  }
}
