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

import { FollowerVm, PSFOLLOWER } from '@neom/models';
import { FollowerApiService } from './follower-api.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
/**
 * Controller for handling followers endpoints sedning request to the v2 pega api.
 */
@Controller('v2/followers')
@ApiTags('follower')
export class FollowerApiController {
  /**
   * Constructor to inject the FollowerApiService.
   * @param _followerApiService The service to handle followers operations.
   */
  constructor(private readonly _followerApiService: FollowerApiService) {}
  /**
   * Gets the followers of a case by the provided id
   *
   * @param {string} caseId - The case id.
   * @returns {Observable<any>} A the observable of type any.
   * @throws {HttpException} If an error occurs while sending the request.
   */
  @Get('/:caseId')
  @ApiOkResponse({
    description: 'Successfully retrieved the followers for the specified case.',
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
    summary: 'Gets the followers of the case by the provided case id',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  getCaseFollowers(
    @Param('caseId') caseId: string,
    @Request() req: Request
  ): Observable<any> {
    return this._followerApiService.getCaseFollowers(caseId, req);
  }
}
