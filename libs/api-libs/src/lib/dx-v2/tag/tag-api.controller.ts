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

import { TagApiService } from './tag-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Controller for handling tags endpoints sending request to the v2 pega api.
 */
@Controller('v2/tag')
@ApiTags('tag')
export class TagApiController {
  /**
   * Constructor to inject the TagApiService.
   * @param _tagApiService The service to handle tags operations.
   */
  constructor(private readonly _tagApiService: TagApiService) {}
  /**
   * Gets the tags by the provided case id
   *
   * @param {string} caseId - The case id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId')
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
    summary: 'Gets the tags by the provided case id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getAttachmentById(
    @Param('caseId') caseId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._tagApiService.getCaseTags(caseId, req);
  }
}
