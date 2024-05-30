/*
https://docs.nestjs.com/controllers#controllers
*/

import { ParseObjectPipe } from '@neom/nst-libs/lib/pipes/parseobject.pipe';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
export class UserController {
  @Get('profile')
  @ApiOkResponse({ description: 'Get user profile of a logged-in user' })
  @ApiBadGatewayResponse({
    status: HttpStatus.BAD_GATEWAY,
    description: 'When Server is down or not reachable',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'When the request is invalid',
  })
  @ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'When the user is not authorized to access the resource',
  })
  @ApiOperation({
    summary: 'Get user profile data by providing the user ID in the URL param',
  })

  // @ApiParam({ name: 'id', description: 'User ID', required: true, type: Number})
  @ApiQuery({ name: 'user', description: 'User Object', required: true })
  @ApiQuery({ name: 'id', description: 'ID', required: true, type: 'number' })
  myprofile(
    // @Param('id', new ParseIntPipe()) id: number,
    @Query('user', ParseObjectPipe) user: { user: string },
    @Query('id', ParseIntPipe) id: number
  ) {
    if (typeof id === 'string')
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    return { user: 'Me' };
  }
}
