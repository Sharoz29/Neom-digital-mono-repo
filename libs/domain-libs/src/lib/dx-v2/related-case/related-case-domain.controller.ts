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

import { RelatedCaseVm, PSRELATED_CASE } from '@neom/models';
import { RelatedCaseDomainService } from './related-case-domain.service';

@Controller('related-case')
@ApiTags('related-case')
// @CustomizeLogInterceptor({module: 'RelatedCase'})
export class RelatedCaseDomainController {
  constructor(
    private readonly _relatedCaseDomainService: RelatedCaseDomainService
  ) {}

  @Get('related-case')
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
  @ApiOperation({ summary: 'Get method for related-case' })
  get(): Observable<any> {
    const handler = () => {};
    return this._relatedCaseDomainService.get('RelatedCase-get', handler);
  }

  @Post('related-case')
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
  @ApiOperation({ summary: 'Post method for related-case' })
  // @ApiBody({ type: () => {} })
  create(@Body() body: RelatedCaseVm): Observable<any> {
    const handler = () => {};
    try {
      return this._relatedCaseDomainService.post(
        PSRELATED_CASE.CREATE,
        handler
      );
    } catch (e: any) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('related-case/:id')
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
  @ApiOperation({ summary: 'Put method for related-case' })
  // @ApiBody({ type: () => {} })
  @ApiParam({ name: 'id', required: true })
  update(@Param() { id }: { id: string }, @Body() {}) {
    const handler = () => {};
    try {
      return this._relatedCaseDomainService.put('RelatedCase-put', handler);
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('related-case/:id')
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
  @ApiOperation({ summary: 'Delete method for related-case' })
  @ApiParam({ name: 'id', required: true })
  delete(@Param() { id }: { id: string }) {
    const handler = () => {};
    return this._relatedCaseDomainService.delete('RelatedCase-delete', handler);
  }
}
