import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ClientProxy } from '@nestjs/microservices';
import { RMQQueues } from '@neom/shared';

import { BaseApiService } from '../../services/baseapi.service';
import { PSCOLLABORATION } from '@neom/models';
import { Observable } from 'rxjs';

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
    try {
      return this.client.send(PSCOLLABORATION.GETDOCUMENTS, {
        headers: req.headers,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getDocumentById(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCOLLABORATION.GETDOCUMENTBYID, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getMessages(req: Request): Observable<any> {
    try {
      return this.client.send(PSCOLLABORATION.GETMESSAGES, {
        headers: req.headers,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getNotifications(req: Request): Observable<any> {
    try {
      return this.client.send(PSCOLLABORATION.GETNOTIFICATIONS, {
        headers: req.headers,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getSpaces(req: Request): Observable<any> {
    try {
      return this.client.send(PSCOLLABORATION.GETSPACES, {
        headers: req.headers,
      });
    } catch (error) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getSpaceById(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCOLLABORATION.GETSPACEBYID, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
  getPinsOfSpace(id: string, req: Request): Observable<any> {
    try {
      return this.client.send(PSCOLLABORATION.GETPINSOFSPACEBYID, {
        headers: req.headers,
        id,
      });
    } catch (error: any) {
      console.error('Error sending message to microservice', error);
      throw error;
    }
  }
}
