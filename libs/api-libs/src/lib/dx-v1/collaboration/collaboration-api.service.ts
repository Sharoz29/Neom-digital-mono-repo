import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { PSCOLLABORATION } from '@neom/models';
import { catchError, Observable } from 'rxjs';

// Extending from BaseApiService to implement Basic Api's for CRUD Functionalities
@Injectable()
export class CollaborationApiService extends BaseApiService<any, any, any> {
  constructor(
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy
  ) {
    super(_client, 'collaboration', cacheManagerRef);
  }
  getDocuments(req: Request): Observable<any> {

      return this.client.send(PSCOLLABORATION.GETDOCUMENTS, {
        headers: req.headers,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getDocumentById(id: string, req: Request): Observable<any> {

      return this.client.send(PSCOLLABORATION.GETDOCUMENTBYID, {
        headers: req.headers,
        id,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getMessages(req: Request): Observable<any> {

      return this.client.send(PSCOLLABORATION.GETMESSAGES, {
        headers: req.headers,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getNotifications(req: Request): Observable<any> {

      return this.client.send(PSCOLLABORATION.GETNOTIFICATIONS, {
        headers: req.headers,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getSpaces(req: Request): Observable<any> {

      return this.client.send(PSCOLLABORATION.GETSPACES, {
        headers: req.headers,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getSpaceById(id: string, req: Request): Observable<any> {

      return this.client.send(PSCOLLABORATION.GETSPACEBYID, {
        headers: req.headers,
        id,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
  getPinsOfSpace(id: string, req: Request): Observable<any> {
 
      return this.client.send(PSCOLLABORATION.GETPINSOFSPACEBYID, {
        headers: req.headers,
        id,
      }).pipe(
        catchError(error => {
          throw new HttpException(
            error.message,
            error?.status 
          );
        })
      );
  }
}
