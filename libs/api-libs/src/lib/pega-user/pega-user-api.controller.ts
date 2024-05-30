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
  Query,
  Request,
} from '@nestjs/common';
import { ApiParam, ApiBody, ApiTags, ApiResponse, ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBadGatewayResponse, ApiGatewayTimeoutResponse } from '@nestjs/swagger';

import { catchError, delay, Observable, of } from 'rxjs';

import { PegaUserVm, PSPEGA_USER } from '@neom/models';
import { PegaUserApiService } from './pega-user-api.service';
import { ParseObjectPipe } from '@neom/nst-libs/lib/pipes/parseobject.pipe';

@Controller('pega-user')
@ApiTags('pega-user')
// @CustomizeLogInterceptor({module: 'PegaUser'})
export class PegaUserApiController {
  constructor(private readonly _pegaUserApiService: PegaUserApiService) {}

  
  @ApiOkResponse({ status: HttpStatus.OK, type: PegaUserVm, isArray: true, description:
    'Successfully retrieved the record for the specified Pega user.'})
  @ApiGatewayTimeoutResponse({
    description: 'Gateway Timeout',
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
  @ApiOperation({ summary: 'Get method for pega-user' })
  @Get('')
  get(
    @Query('filter', ParseObjectPipe) filter: object,
    @Request() req: Request
  ): Observable<any> {
    return this._pegaUserApiService.get(req, 'PegaUser-get', filter || {})
    .pipe(
      delay(10000),
    );
  }

  // @Post('pega-user')
  // @ApiResponse({
  //   status: 201,
  //   description: 'Created: The resource has been successfully created.',
  //   type: PegaUserVm,
  // })
  // @ApiResponse({
  //   status: 400,
  //   description:
  //     'Bad Request: The request could not be understood or was missing required parameters.',
  // })
  // @ApiResponse({
  //   status: 502,
  //   description: 'Bad Gateway',
  // })
  // @ApiOperation({ summary: 'Post method for pega-user' })
  // // @ApiBody({ type: () => {} })
  // create(@Body() body: PegaUserVm): Observable<any> {
  //   try {
      
  //     return this._pegaUserApiService.post(PSPEGA_USER.CREATE, body);
  //   } catch (e: any) {
  //     throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // @Put('pega-user/:id')
  // @ApiResponse({
  //   status: 201,
  //   description: 'Updated: The resource has been successfully updated.',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description:
  //     'Bad Request: The request could not be understood or was missing required parameters.',
  // })
  // @ApiResponse({
  //   status: 502,
  //   description: 'Bad Gateway',
  // })
  // @ApiOperation({ summary: 'Put method for pega-user' })
  // // @ApiBody({ type: () => {} })
  // @ApiParam({ name: 'id', required: true })
  // update(@Param() { id }: { id: string }, @Body() {}) {
  //   const handler = () => {};
  //   try {
  //     return this._pegaUserApiService.put('PegaUser-put', handler);
  //   } catch (error: any) {
  //     throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // @Delete('pega-user/:id')
  // @ApiResponse({
  //   status: 201,
  //   description: 'Deleted: The resource has been successfully deleted.',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description:
  //     'Bad Request: The request could not be understood or was missing required parameters.',
  // })
  // @ApiResponse({
  //   status: 502,
  //   description: 'Bad Gateway',
  // })
  // @ApiOperation({ summary: 'Delete method for pega-user' })
  // @ApiParam({ name: 'id', required: true })
  // delete(@Param() { id }: { id: string }) {
  //   const handler = () => {};
  //   return this._pegaUserApiService.delete('PegaUser-delete', handler);
  // }
}
