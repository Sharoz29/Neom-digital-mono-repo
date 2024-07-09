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

import { ParticipantVm, PSPARTICIPANT } from '@neom/models';
import { ParticipantDomainService } from './participant-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('participant')
@ApiTags('participant')
// @CustomizeLogInterceptor({module: 'Participant'})
export class ParticipantDomainController {
  constructor(
    private readonly _participantDomainService: ParticipantDomainService
  ) {}

  @MessagePattern(PSPARTICIPANT.GET)
  getParticipantsOfACase(payload: any): Observable<any> {
    return this._participantDomainService.getParticipantsOfACase(payload);
  }
  @MessagePattern(PSPARTICIPANT.GETONE)
  getParticipantOfACaseById(payload: any): Observable<any> {
    return this._participantDomainService.getParticipantOfACaseById(payload);
  }
  @MessagePattern(PSPARTICIPANT.GETROLES)
  getParticipantRoles(payload: any): Observable<any> {
    return this._participantDomainService.getParticipantRoles(payload);
  }
  @MessagePattern(PSPARTICIPANT.GETROLEDETAILS)
  getParticipantRoleDetails(payload: any): Observable<any> {
    return this._participantDomainService.getParticipantRoleDetails(payload);
  }
}
