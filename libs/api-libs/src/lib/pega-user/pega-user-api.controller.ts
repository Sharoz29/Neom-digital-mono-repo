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
} from '@nestjs/common';
import {
  ApiParam,
  ApiBody,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { PegaUserApiService } from './pega-user-api.service';

@Controller('pega-user')
@ApiTags('pega-user')
// @CustomizeLogInterceptor({module: 'PegaUser'})
export class PegaUserApiController {
  constructor(private readonly _pegaUserApiService: PegaUserApiService) {}

  @Get('pega-user')
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved the record for the specified Pega user.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: The requested resource could not be found.',
  })
  @ApiOperation({ summary: 'Get method for pega-user' })
  get(): Observable<any> {
    const handler = () => {};
    return this._pegaUserApiService.get('PegaUser-get', handler);
  }

  @Post('pega-user')
  @ApiResponse({
    status: 201,
    description: 'Created: The resource has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiOperation({ summary: 'Post method for pega-user' })
  // @ApiBody({ type: () => {} })
  create(@Body() {}): Observable<any> {
    const handler = () => {};
    try {
      return this._pegaUserApiService.post('PegaUser-post', handler);
    } catch (e: any) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('pega-user/:id')
  @ApiResponse({
    status: 201,
    description: 'Updated: The resource has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiOperation({ summary: 'Put method for pega-user' })
  // @ApiBody({ type: () => {} })
  @ApiParam({ name: 'id', required: true })
  update(@Param() { id }: { id: string }, @Body() {}) {
    const handler = () => {};
    try {
      return this._pegaUserApiService.put('PegaUser-put', handler);
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('pega-user/:id')
  @ApiResponse({
    status: 201,
    description: 'Deleted: The resource has been successfully deleted.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: The request could not be understood or was missing required parameters.',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway',
  })
  @ApiOperation({ summary: 'Delete method for pega-user' })
  @ApiParam({ name: 'id', required: true })
  delete(@Param() { id }: { id: string }) {
    const handler = () => {};
    return this._pegaUserApiService.delete('PegaUser-delete', handler);
  }
}
