import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { PSATTACHMENT } from '@neom/models';
import { catchError, Observable } from 'rxjs';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class AttachmentApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'attachment', cacheManagerRef);
  }

  getAttachmentById(id: string, req: Request): Observable<any> {
    return this.client
      .send(PSATTACHMENT.GETONEV1, {
        headers: req.headers,
        id,
      })
      .pipe(
        catchError((error) => {
          throw new HttpException(error.message, error?.status);
        })
      );
  }
  getCaseAttachments(caseId: string, req: Request): Observable<any> {
    return this.client
      .send(PSATTACHMENT.GETCASEATTACHMENTSV1, {
        headers: req.headers,
        caseId,
      })
      .pipe(
        catchError((error) => {
          throw new HttpException(error.message, error?.status);
        })
      );
  }
  getCaseAttachmentCategories(caseId: string, req: Request): Observable<any> {
    return this.client
      .send(PSATTACHMENT.GETCASEATTACHMENTCATEGORIESV1, {
        headers: req.headers,
        caseId,
      })
      .pipe(
        catchError((error) => {
          throw new HttpException(error.message, error?.status);
        })
      );
  }
}
