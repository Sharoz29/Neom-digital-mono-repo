/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RequestHandler } from '@nestjs/common/interfaces';
import { Cache } from 'cache-manager';

@Injectable()
export class BaseApiService {
  constructor(private readonly client: ClientProxy, pattern: string, cacheManagerRef: Cache) {
    
  }
  get(handler: RequestHandler){
    return this.client.send(`${}`, handler);
  }
  post(handler: RequestHandler){
    return this.client.send(handler, handler);
  }
  put(handler: RequestHandler){
    this.client.send(handler, handler);
  }
  delete(handler: RequestHandler){
    this.client.send(handler, handler);
  }
}
