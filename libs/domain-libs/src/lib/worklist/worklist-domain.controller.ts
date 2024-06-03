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

import { WorklistVm, PSWORKLIST, PSCASE_TYPES } from '@neom/models';
import { WorklistDomainService } from './worklist-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('worklist')
@ApiTags('worklist')
// @CustomizeLogInterceptor({module: 'Worklist'})
export class WorklistDomainController {
  constructor(private readonly _worklistDomainService: WorklistDomainService) {}

  @MessagePattern(PSWORKLIST.GET)
  async getCaseTypes({ headers }: any) {
    return this._worklistDomainService.getWorklist(headers);
  }
}
