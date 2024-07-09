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

import { CollaborationVm, PSCOLLABORATION } from '@neom/models';
import { CollaborationDomainService } from './collaboration-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('v1/collaboration')
@ApiTags('collaboration')
// @CustomizeLogInterceptor({module: 'Collaboration'})
export class CollaborationDomainController {
  constructor(
    private readonly _collaborationDomainService: CollaborationDomainService
  ) {}
  @MessagePattern(PSCOLLABORATION.GETDOCUMENTS)
  getDocuments({ headers }: any): Observable<any> {
    return this._collaborationDomainService.getDocuments(headers);
  }
  @MessagePattern(PSCOLLABORATION.GETDOCUMENTBYID)
  getDocumentById(payload: any): Observable<any> {
    return this._collaborationDomainService.getDocumentById(payload);
  }
  @MessagePattern(PSCOLLABORATION.GETMESSAGES)
  getMessages({ headers }: any): Observable<any> {
    return this._collaborationDomainService.getMessages(headers);
  }
  @MessagePattern(PSCOLLABORATION.GETNOTIFICATIONS)
  getNotifications({ headers }: any): Observable<any> {
    return this._collaborationDomainService.getNotifications(headers);
  }
  @MessagePattern(PSCOLLABORATION.GETSPACES)
  getSpaces({ headers }: any): Observable<any> {
    return this._collaborationDomainService.getSpaces(headers);
  }
  @MessagePattern(PSCOLLABORATION.GETSPACEBYID)
  getSpaceById(payload: any): Observable<any> {
    return this._collaborationDomainService.getSpaceById(payload);
  }
  @MessagePattern(PSCOLLABORATION.GETPINSOFSPACEBYID)
  getPinsOfSpace(payload: any): Observable<any> {
    return this._collaborationDomainService.getPinsOfSpace(payload);
  }
}
