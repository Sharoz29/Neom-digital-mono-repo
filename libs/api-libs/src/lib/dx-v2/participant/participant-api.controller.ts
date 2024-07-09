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

import { ParticipantVm, PSPARTICIPANT } from '@neom/models';
import { ParticipantApiService } from './participant-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
/**
 * Controller for handling participants endpoints sending request to the v2 pega api.
 */
@Controller('v2/participants')
@ApiTags('participant')
export class ParticipantApiController {
  /**
   * Constructor to inject the ParticipantApiService.
   * @param _participantApiService The service to handle participants operations.
   */
  constructor(private readonly _participantApiService: ParticipantApiService) {}

  /**
   * Gets the participants of a case by the provided case id
   *
   * @param {string} caseId - The case id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId')
  @ApiOkResponse({
    description:
      'Successfully retrieved the participants for the specified case.',
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
    summary: 'Gets the participants of a case by the provided case id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getParticipantsOfACase(
    @Param('caseId') caseId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._participantApiService.getParticipantsOfACase(caseId, req);
  }

  /**
   * Gets a specific participant of a case by the provided case id and the participant id
   *
   * @param {string} caseId - The case id.
   * @param {string} participantId - The participant id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId/participants/:participantId')
  @ApiOkResponse({
    description:
      'Successfully retrieved the specific participant for the specified case.',
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
      'Gets a specific participant of a case by the provided case id and the participant id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getParticipantOfACaseById(
    @Param('caseId') caseId: string,
    @Param('participantId') participantId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._participantApiService.getParticipantOfACaseById(
      caseId,
      participantId,
      req
    );
  }
  /**
   * Gets the participant roles of a case by the provided case id
   *
   * @param {string} caseId - The case id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId/participant_roles')
  @ApiOkResponse({
    description:
      'Successfully retrieved the participant roles for the specified case.',
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
    summary: 'Gets the participant roles of a case by the provided case id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getParticipantRoles(
    @Param('caseId') caseId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._participantApiService.getParticipantRoles(caseId, req);
  }
  /**
   * Gets the details of a specific participant role of a case by the provided case id and participant role id
   *
   * @param {string} caseId - The case id.
   * @param {string} participantRoleId - The participant role id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId/participant_roles/:participantRoleId')
  @ApiOkResponse({
    description:
      'Successfully retrieved the participant roles for the specified case.',
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
      'Gets the details of a specific participant role of a case by the provided case id and participant role id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getParticipantRoleDetails(
    @Param('caseId') caseId: string,
    @Param('participantRoleId') participantRoleId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._participantApiService.getParticipantRoleDetails(
      caseId,
      participantRoleId,
      req
    );
  }
}
