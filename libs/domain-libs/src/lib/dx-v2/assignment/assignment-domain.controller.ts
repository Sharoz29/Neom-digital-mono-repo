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

@Controller('assignment')
@ApiTags('assignment')
// @CustomizeLogInterceptor({module: 'Assignment'})
export class AssignmentDomainController {
  constructor(
    private readonly _assignmentDomainService: AssignmentDomainService
  ) {}
  @MessagePattern(PSASSIGNMENT.GETONEV2)
  getAssignmentById(payload: any): Observable<any> {
    return this._assignmentDomainService.getAssignmentById(payload);
  }
  @MessagePattern(PSASSIGNMENT.GETACTIONSV2)
  getActionsForAssignment(payload: any): Observable<any> {
    return this._assignmentDomainService.getActionsForAssignment(payload);
  }
  @MessagePattern(PSASSIGNMENT.GETNEXTV2)
  getNextAssignmentDetail(payload: any): Observable<any> {
    return this._assignmentDomainService.getNextAssignmentDetail(payload);
  }
}
