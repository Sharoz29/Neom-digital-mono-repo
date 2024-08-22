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

import { DocumentVm, PSDOCUMENT } from '@neom/models';
import { DocumentDomainService } from './document-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('document')
@ApiTags('document')
export class DocumentDomainController {
  constructor(private readonly _documentDomainService: DocumentDomainService) {}

  @MessagePattern(PSDOCUMENT.GETONEV2)
  getDocumentById(payload: any): Observable<any> {
    return this._documentDomainService.getDocumentById(payload);
  }
}
