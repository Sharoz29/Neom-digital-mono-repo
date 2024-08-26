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

import { AttachmentVm, PSATTACHMENT } from '@neom/models';
import { AttachmentDomainService } from './attachment-domain.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('attachment')
@ApiTags('attachment')
// @CustomizeLogInterceptor({module: 'Attachment'})
export class AttachmentDomainController {
  constructor(
    private readonly _attachmentDomainService: AttachmentDomainService
  ) {}
  @MessagePattern(PSATTACHMENT.GETONEV1)
  getAttachmentById(payload: any): Observable<any> {
    return this._attachmentDomainService.getAttachmentById(payload);
  }
  @MessagePattern(PSATTACHMENT.GETCASEATTACHMENTSV1)
  getCaseAttachments(payload: any): Observable<any> {
    return this._attachmentDomainService.getCaseAttachments(payload);
  }
  @MessagePattern(PSATTACHMENT.GETCASEATTACHMENTCATEGORIESV1)
  getCaseAttachmentCategories(payload: any): Observable<any> {
    return this._attachmentDomainService.getCaseAttachmentCategories(payload);
  }
}
