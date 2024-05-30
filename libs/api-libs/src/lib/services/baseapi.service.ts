/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RequestHandler } from '@nestjs/common/interfaces';
import { Cache } from 'cache-manager';

@Injectable()
export class BaseApiService {
  constructor(
    private readonly client: ClientProxy,
    pattern: string,
    cacheManagerRef: Cache
  ) {}
  get(pattern: string, handler: RequestHandler) {
    return this.client.send(pattern, handler);
  }
  post(pattern: string, handler: RequestHandler) {
    return this.client.send(pattern, handler);
  }
  put(pattern: string, handler: RequestHandler) {
    this.client.send(pattern, handler);
  }
  delete(pattern: string, handler: RequestHandler) {
    this.client.send(pattern, handler);
  }
}
