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

import { AssignmentVm, PSASSIGNMENT } from '@neom/models';
import { AssignmentDomainService } from './assignment-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('assignments')
@ApiTags('assignments')
// @CustomizeLogInterceptor({module: 'Assignment'})
export class AssignmentDomainController {
  constructor(
    private readonly _assignmentDomainService: AssignmentDomainService
  ) {}

  @MessagePattern(PSASSIGNMENT.GET)
  async getAssignments({ headers }: any) {
    return this._assignmentDomainService.getAssignments(headers);
  }
  @MessagePattern(PSASSIGNMENT.GETONE)
  async getAssignmentById(payload: any) {
    return this._assignmentDomainService.getAssignmentById(payload);
  }
  @MessagePattern(PSASSIGNMENT.GETFIELDS)
  async getFieldsForAssignment(payload: any) {
    return this._assignmentDomainService.getFieldsForAssignment(payload);
  }
}
