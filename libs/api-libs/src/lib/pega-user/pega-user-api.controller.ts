import {
  Controller,
  Get,
  Request,
  UseGuards,
  Query,
  ParseIntPipe,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Put,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBadGatewayResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiCreatedResponse,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { PegaUserApiService } from './pega-user-api.service';
import { PegaUser, PegaUserVm, PegaUserCreateVm, UserRole } from '@models';
import { Roles } from '@api-gateway/shared/decorators/user-roles.decorators';
import { GetOperationId } from '@api-gateway/shared/utilities/get-operation-id';
import { ParseObjectPipe } from '@api-gateway/shared/pipes/jsonToObject';
import { FetchCountPipe } from '@api-gateway/shared/pipes/fetchCount';
import { UpdateGenericVm } from '@api-models/shared/shared-vm.models';
import { RolesGuard } from '@api-gateway/shared/guards/roles.guard';
import { ApiException } from '@models/api-exception.model';
import { CustomizeLogInterceptor } from '@api-gateway/shared/interceptors/reflector.meta';

@Controller('pega-user')
@ApiTags(PegaUser.modelName)
@CustomizeLogInterceptor({ module: 'PegaUser' })
export class PegaUserApiController {
  constructor(private readonly _pegaUserApiService: PegaUserApiService) {
  }

  @Get()
  // Change Roles based on your requirement
  @Roles(UserRole.Admin, UserRole.Csr)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: PegaUserVm, isArray: true })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiBadGatewayResponse({ type: ApiException })
  @ApiNotFoundResponse({ type: ApiException })
  @ApiOperation(
    GetOperationId(
      PegaUser.modelName,
      'GetAll',
      'Get all documents based on a filter, skip limit and sort'
    )
  )
  @ApiQuery({ name: 'filter', required: true })
  @ApiQuery({ name: 'skip', required: true, type: 'number' })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiQuery({ name: 'sort', required: true })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({
    name: 'populators',
    required: false,
  })
  findAll(
    @Query('filter', new ParseObjectPipe()) filter,
    @Query('skip', new ParseIntPipe()) skip: number,
    @Query('limit', new ParseIntPipe(), FetchCountPipe)
    limit: number,
    @Query('sort', new ParseObjectPipe()) sort,
    @Query('populators', new ParseObjectPipe()) populators,
    @Query('fields', new ParseObjectPipe()) fields
  ): Observable<PegaUserVm[]> {
    return this._pegaUserApiService.findAll({
      filter,
      skip,
      limit,
      sort: sort || { createdAt: -1 },
      populators,
      fields,
    });
  }

  @Get('count')
  // Change Roles based on your requirement
  @Roles(UserRole.Admin, UserRole.User)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: Number })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(
    GetOperationId(
      PegaUser.modelName,
      'GetCount',
      'Get the total document count based on a particular filter'
    )
  )
  @ApiQuery({ name: 'filter', required: true })
  getDocCount(
    @Query('filter', new ParseObjectPipe()) filter
  ): Observable<number> {
    console.log(filter);
    return this._pegaUserApiService.getDocumentCount(filter);
  }

  // !NO Get Requets after this!!
  @Get(':id')
  // You can uncomment below two lines to enable caching.
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(60 * 60 * 24 * 30) // Cache for 30 Days
  @ApiOkResponse({ type: PegaUserVm })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiBadGatewayResponse({ type: ApiException })
  @ApiNotFoundResponse({ type: ApiException })
  @ApiOperation(
    GetOperationId(PegaUser.modelName, 'FindById', 'Find a record by its ID')
  )
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiQuery({ name: 'fields', required: false })
  @ApiQuery({
    name: 'populators',
    required: false,
  })
  findById(
    @Param('id') id: string,
    @Query('populators', new ParseObjectPipe()) populators,
    @Query('fields', new ParseObjectPipe()) fields
  ): Observable<PegaUserVm> {
    console.log(id);
    return this._pegaUserApiService.findById({ id, populators, fields });
  }

  @Post()
  @ApiCreatedResponse({
    type: PegaUserVm,
    description: 'PegaUser created successfully',
  })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiBadGatewayResponse({ type: ApiException })
  @ApiOperation(
    GetOperationId(PegaUser.modelName, 'Create', 'Creates a new record')
  )
  @ApiBody({ type: () => PegaUserCreateVm })
  create(@Body() pegaUserVm: PegaUserCreateVm): Observable<PegaUserVm> {
    try {
      return this._pegaUserApiService.create(pegaUserVm);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put()
  // @Roles(UserRole.Admin, UserRole.User)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: PegaUserVm })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiBadGatewayResponse({ type: ApiException })
  @ApiOperation(
    GetOperationId(
      PegaUser.modelName,
      'Update',
      'Updates a record using its id and modifier'
    )
  )
  @ApiBody({ type: () => UpdateGenericVm })
  update(
    @Body() pegaUserUpdateVm: UpdateGenericVm<PegaUserVm>,
    @Request() req
  ): Observable<PegaUserVm> {
    return this._pegaUserApiService.update(
      pegaUserUpdateVm.id,
      pegaUserUpdateVm.modifier
    );
  }

  @Delete(':id')
  // @Roles(UserRole.Admin)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: PegaUserVm, description: 'Deleted Record' })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiBadGatewayResponse({ type: ApiException })
  @ApiOperation(
    GetOperationId(PegaUser.modelName, 'Delete', 'Deletes a record by its ID')
  )
  @ApiParam({ name: 'id', required: true })
  delete(@Param() { id }: { id: string }): Observable<PegaUserVm> {
    return this._pegaUserApiService.delete(id);
  }
}
