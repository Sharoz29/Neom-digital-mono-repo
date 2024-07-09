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

import { CollaborationApiService } from './collaboration-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
/**
 * Controller for handling collaboration endpoints sedning request to the v1 pega api.
 */
@Controller('v1/collaboration')
@ApiTags('collaboration')
export class CollaborationApiController {
  /**
   * Constructor to inject the CollaborationApiService.
   * @param _collaborationApiService The service to handle collaboration operations.
   */
  constructor(
    private readonly _collaborationApiService: CollaborationApiService
  ) {}
  /**
   * Gets all the documents.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/documents')
  @ApiOkResponse({
    description: 'Successfully retrieved all documents.',
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
    summary: 'Gets all the documents',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getDocuments(@Request() req: Request): Observable<any> {
    return this._collaborationApiService.getDocuments(req);
  }
  /**
   * Gets the document by the provided id
   *
   * @param {string} id - The document id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/documents/:id')
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
  getDocumentById(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._collaborationApiService.getDocumentById(id, req);
  }
  /**
   * Gets all the messages.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/messages')
  @ApiOkResponse({
    description: 'Successfully retrieved all messages.',
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
    summary: 'Gets all the messages',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getMessages(@Request() req: Request): Observable<any> {
    return this._collaborationApiService.getMessages(req);
  }
  /**
   * Gets all the notifications.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/notifications')
  @ApiOkResponse({
    description: 'Successfully retrieved all notifications.',
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
    summary: 'Gets all the notifications',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getNotifications(@Request() req: Request): Observable<any> {
    return this._collaborationApiService.getNotifications(req);
  }
  /**
   * Gets all the notifications.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/spaces')
  @ApiOkResponse({
    description: 'Successfully retrieved all spaces.',
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
    summary: 'Gets all the spaces',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getSpaces(@Request() req: Request): Observable<any> {
    return this._collaborationApiService.getSpaces(req);
  }
  /**
   * Gets the details of a space by the provided id
   *
   * @param {string} id - The space id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/spaces/:id')
  @ApiOkResponse({
    description: 'Successfully retrieved the record for the specified space.',
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
    summary: 'Gets the details of a space by the provided space id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getSpaceById(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._collaborationApiService.getSpaceById(id, req);
  }
  /**
   * Gets the pins of a space by the provided id
   *
   * @param {string} id - The space id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/spaces/:id/pins')
  @ApiOkResponse({
    description: 'Successfully retrieved the pins for the specified space.',
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
    summary: 'Gets the pins of a space by the provided space id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getPinsOfSpace(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._collaborationApiService.getPinsOfSpace(id, req);
  }
}
