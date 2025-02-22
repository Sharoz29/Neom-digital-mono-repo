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

import { AssignmentVm, PSASSIGNMENT } from '@neom/models';
import { AssignmentApiService } from './assignment-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Controller for handling assignments endpoints sedning request to the v2 pega api.
 */
@Controller('v2/assignments')
@ApiTags('assignment')
export class AssignmentApiController {
  /**
   * Constructor to inject the AssignmentApiService.
   * @param _assignmentApiService The service to handle assignments operations.
   */
  constructor(private readonly _assignmentApiService: AssignmentApiService) {}

  /**
   * Gets the assignment by the provided id
   *
   * @param {string} id - The assignment id.
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
    summary: 'Gets the assignment by the provided id',
  })
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(60 * 60 * 24)
  getAssignmentById(
    @Param('id') id: string,
    @Request() req: Request
  ): Observable<any> {
    return this._assignmentApiService.getAssignmentById(id, req);
  }

  /**
   * Gets the actions for the assignment by the provided assignment id and action id
   *
   * @param {string} assignmentId - The assignment id.
   * @param {string} actionId - The action id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:assignmentId/actions/:actionId')
  @ApiOkResponse({
    description:
      'Successfully retrieved the record for the field types for the assignment.',
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
      'Gets the actions for the assignment by the provided case id and action id',
  })
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(60 * 60 * 24)
  getActionsForAssignment(
    @Param('assignmentId') assignmentId: string,
    @Param('actionId') actionId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._assignmentApiService.getActionsForAssignment(
      assignmentId,
      actionId,
      req
    );
  }
  @Get('/next')
  @ApiOkResponse({
    description: 'Successfully retrieved details of next assignment.',
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
    summary: 'Gets the details of next assignment',
  })
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(60 * 60 * 24)
  getNextAssignmentDetail(@Request() req: Request): Observable<any> {
    return this._assignmentApiService.getNextAssignmentDetail(req);
  }
}
