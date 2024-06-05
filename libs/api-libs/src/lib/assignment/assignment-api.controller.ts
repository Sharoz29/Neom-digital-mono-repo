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

import { AssignmentVm, PSASSIGNMENT } from '@neom/models';
import { AssignmentApiService } from './assignment-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('assignments')
@ApiTags('assignment')
// @CustomizeLogInterceptor({module: 'Assignment'})
export class AssignmentApiController {
  constructor(private readonly _assignmentApiService: AssignmentApiService) {}

  // Get all the assinments
  @Get()
  @ApiOkResponse({
    description: 'Successfully retrieved all assignments',
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
    summary: 'Gets all the assignments',
  })
  @UseInterceptors(CacheInterceptor)
  async getAssignments(@Request() req: Request) {
    return this._assignmentApiService.getAssignments(req);
  }

  // Gets the assignment by the provided id
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  async getAssignmentById(@Param('id') param: string, @Request() req: Request) {
    return this._assignmentApiService.getAssignmentById(param, req);
  }

  // Gets the fields for the assignment by the provided assignment id and action id
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
      'Gets the fields for the assignment by the provided case id and action id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  async getFieldsForAssignment(
    @Param('assignmentId') assignmentId: string,
    @Param('actionId') actionId: string,
    @Request() req: Request
  ) {
    return this._assignmentApiService.getFieldsForAssignment(
      assignmentId,
      actionId,
      req
    );
  }
}
