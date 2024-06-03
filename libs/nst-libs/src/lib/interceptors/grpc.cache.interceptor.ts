/*
https://docs.nestjs.com/interceptors#interceptors
*/

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import {Cache} from 'cache-manager';
import { CACHE_MANAGER, CACHE_TTL_METADATA } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';


@Injectable()
export class GrpcInterceptor implements NestInterceptor {
  logger = new Logger();
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector
  ) {
    // this.cacheManager = cacheManager;
    // this.reflector = reflector;
  }
  async intercept(context: ExecutionContext, next: CallHandler) {

    const key = this.trackBy(context);

    console.log('Key for caching: ', key);

    // this.logger.log(`Key for caching: ${key} \n TTL: ${ttl}`);

    //! Handler TTL has more precedence over Class TTL.
    //! Handler TTL can be set to 0 to disable caching on a particular handler.

    const ttlClassDecorator = this.reflector.get(CACHE_TTL_METADATA, context.getClass());
    const ttlHandlerDecorator = this.reflector.get(CACHE_TTL_METADATA, context.getHandler())
    const ttl = ttlHandlerDecorator == 0 ? 0 : ttlHandlerDecorator || ttlClassDecorator;

    // this.logger.log(`Key for caching: ${key} \n TTL: ${ttl}`);
    if (!key || !ttl || ttl == 0) {
      return next.handle();
    }
    try {
      const value = await this.cacheManager.get(key);
      if (value) {
        return of(value);
      }
      return next.handle().pipe(
        tap((response) => {
          if (response) {
            this.cacheManager.set(key, response, ttl ? ttl : 0);
          }
        })
      );
    } catch (_a) {
      return next.handle();
    }
  }

  trackBy(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const args = context.switchToRpc().getContext().args;
    const data = context.switchToRpc().getData();
    if (!data || !args) return;
    if (!request.method) {
      return `${args}-${JSON.stringify(data)}`;
    }
    return;
  }
}
