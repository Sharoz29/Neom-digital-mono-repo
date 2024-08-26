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

  @MessagePattern(PSPARTICIPANT.GETV2)
  getParticipantsOfACase(payload: any): Observable<any> {
    return this._participantDomainService.getParticipantsOfACase(payload);
  }
  @MessagePattern(PSPARTICIPANT.GETONEV2)
  getParticipantOfACaseById(payload: any): Observable<any> {
    return this._participantDomainService.getParticipantOfACaseById(payload);
  }
  @MessagePattern(PSPARTICIPANT.GETROLESV2)
  getParticipantRoles(payload: any): Observable<any> {
    return this._participantDomainService.getParticipantRoles(payload);
  }
  @MessagePattern(PSPARTICIPANT.GETROLEDETAILSV2)
  getParticipantRoleDetails(payload: any): Observable<any> {
    return this._participantDomainService.getParticipantRoleDetails(payload);
  }
}
