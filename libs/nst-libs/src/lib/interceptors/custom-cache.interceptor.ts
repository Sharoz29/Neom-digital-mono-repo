/*
https://docs.nestjs.com/interceptors#interceptors
*/

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Request } from "express";
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, CACHE_TTL_METADATA } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector
  ) {
    // this.cacheManager = cacheManager;
    // this.reflector = reflector;
  }
  async intercept(context: ExecutionContext, next: CallHandler){
    const logger = new Logger('CustomCacheInterceptor');
    const request: Request = context.switchToHttp().getRequest();
    const grpcCtx = context.switchToRpc()?.getContext();
    const message = grpcCtx?.getMessage && grpcCtx?.getMessage();
    
    // if you want to disable caching for a particular request, you can pass uc=true in the GRPC Headers.
    let grpcCached = false;

    // if you want to enable caching then pass $c=1 in the query string for HTTP Cache.
    let httpCached = false;


    const key = this.trackBy(context);

    if (!key) {
      logger.log(`no key found`);
      return next.handle();
    }
    
    if(message) {
      if(message?.properties?.headers?.$c === 'true') {
        grpcCached = true;
      }
    }

    if (request?.url) {
      const query = request.query;
      if (query && query['$c'] === '1') {
        httpCached = true;
      }
    }
    //! Handler TTL has more precedence over Class TTL.
    //! Handler TTL can be set to 0 to disable caching on a particular handler.

    const ttlClassDecorator = this.reflector.get(
      CACHE_TTL_METADATA,
      context.getClass()
    );
    const ttlHandlerDecorator = this.reflector.get(
      CACHE_TTL_METADATA,
      context.getHandler()
    );

    
    const ttl =
      ttlHandlerDecorator == 0 ? 0 : ttlHandlerDecorator || ttlClassDecorator;


    // ttl 0 will send uncached request.
    // else both grpcCached and httpCached should be false to return uncached value.
    if ( ttl == 0 || (!grpcCached && !httpCached)) {
      logger.log(`Key for caching: ${key} TTL: ${ttl}: Uncached`);
      return next.handle().pipe(
        tap((response) => {
          if (response) {
            this.cacheManager.set(key, response, ttl ? ttl : 0);
          }
        })
      );
    }
    
    try {
      const value = await this.cacheManager.get(key);
      // If either HTTP or GRPC is cached, then return the cached value.
      if (value && (httpCached || grpcCached) ) {
        logger.log(`Key for caching: ${key} TTL: ${ttl}: Cached`);
        return of(value);
      }
      logger.log(`Key for caching: ${key} TTL: ${ttl}: Uncached`);
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
    const request: Request = context.switchToHttp().getRequest();
    let args = context.switchToRpc().getContext().args;
    const data = context.switchToRpc().getData();

    if(request?.method === 'GET')
      return `${request.url}`;
    
    if (!data || !args) return '';
    
    // Get last argument
    if(args?.length) args = args[args.length - 1];
    return `${args}-${JSON.stringify(data)}`;
    
  }
}
