import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Put,
  Request,
  Delete,
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

import { AttachmentVm, PSATTACHMENT } from '@neom/models';
import { AttachmentApiService } from './attachment-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
/**
 * Controller for handling attachments endpoints sending request to the v2 pega api.
 */
@Controller('v2/attachments')
@ApiTags('attachment')
export class AttachmentApiController {
  /**
   * Constructor to inject the AttachmentApiService.
   * @param _attachmentApiService The service to handle attachments operations.
   */
  constructor(private readonly _attachmentApiService: AttachmentApiService) {}
  /**
   * Gets the attachments by the provided id
   *
   * @param {string} id - The attachments id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:id')
  @ApiOkResponse({
    description:
      'Successfully retrieved the record for the specified assignment.',
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
    summary: 'Gets the attachment by the provided id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getAttachmentById(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._attachmentApiService.getAttachmentById(id, req);
  }

  /**
   * Gets the attachments of a case by the provided id
   *
   * @param {string} caseId - The case id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getCaseAttachments(
    @Param('caseId') caseId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._attachmentApiService.getCaseAttachments(caseId, req);
  }
  /**
   * Gets the attachment categories of a case by the provided id
   *
   * @param {string} caseId - The case id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId/attachment_categories')
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getCaseAttachmentCategories(
    @Param('caseId') caseId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._attachmentApiService.getCaseAttachmentCategories(caseId, req);
  }
}
