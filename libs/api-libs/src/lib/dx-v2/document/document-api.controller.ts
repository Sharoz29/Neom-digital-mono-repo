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

import { DocumentVm, PSDOCUMENT } from '@neom/models';
import { DocumentApiService } from './document-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
/**
 * Controller for handling document endpoints sending request to the v2 pega api.
 */
@Controller('v2/documents')
@ApiTags('document')
export class DocumentApiController {
  /**
   * Constructor to inject the DocumentApiService.
   * @param _documentApiService The service to handle document operations.
   */
  constructor(private readonly _documentApiService: DocumentApiService) {}

  /**
   * Gets the document by the provided id
   *
   * @param {string} id - The document id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:id')
  @ApiOkResponse({
    description:
      'Successfully retrieved the record for the specified document.',
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
    summary: 'Gets the document by the provided id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getAssignmentById(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._documentApiService.getDocumentById(id, req);
  }
}
