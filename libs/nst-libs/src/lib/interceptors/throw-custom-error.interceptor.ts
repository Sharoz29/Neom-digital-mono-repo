/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ThrowErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    if (req.headers['throw-error']) {
      throw new HttpException(
        'Custom on-demand Error thrown',
        parseInt(req.headers['throw-error'])
      );
    }
    return next
      
      .handle()
      .pipe(
      );
  }
}
