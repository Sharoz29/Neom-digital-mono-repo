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

@Controller('cases')
@ApiTags('case')
export class CaseApiController {
  constructor(private readonly _caseApiService: CaseApiService) {}

  // Get all the cases
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
  @CacheTTL(60 * 60 * 24)
  async getCases(@Request() req: Request) {
    return this._caseApiService.getCases(req);
  }

  // Gets the case by the provided id
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
  @CacheTTL(60 * 60 * 24)
  async getCaseById(@Param('id') param: string, @Request() req: Request) {
    return this._caseApiService.getCaseById(param, req);
  }

  // Gets the attachment of the case
  @Get('/:caseId/attachments')
  @ApiOkResponse({
    description:
      'Successfully retrieved the attachments for the specified case.',
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
    summary: 'Gets the attachments of the case by the provided case id',
  })
  async getCaseAttachments(
    @Param('caseId') caseId: string,
    @Request() req: Request
  ) {
    return this._caseApiService.getCaseAttachments(caseId, req);
  }

  // Gets the fields for the case by the provided case id and action id
  @Get('/:caseInfoId/actions/:actionId')
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  async getFieldsForCase(
    @Param('caseInfoId') caseInfoId: string,
    @Param('actionId') actionId: string,
    @Request() req: Request
  ) {
    return this._caseApiService.getFieldsForCase(caseInfoId, actionId, req);
  }

  // Gets the page for the case by the provided case id and page id
  @Get('/:caseInfoId/pages/:pageId')
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  async getCasePage(
    @Param('caseInfoId') caseInfoId: string,
    @Param('pageId') pageId: string,
    @Request() req: Request
  ) {
    return this._caseApiService.getCasePage(caseInfoId, pageId, req);
  }

  // Gets the view for the case by the provided case id and view id
  @Get('/:caseInfoId/views/:viewId')
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  async getCaseView(
    @Param('caseInfoId') caseInfoId: string,
    @Param('viewId') viewId: string,
    @Request() req: Request
  ) {
    return this._caseApiService.getCaseView(caseInfoId, viewId, req);
  }
}
