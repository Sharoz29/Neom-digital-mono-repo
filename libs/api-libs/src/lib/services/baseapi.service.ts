/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RequestHandler } from '@nestjs/common/interfaces';
import { Cache } from 'cache-manager';
import { Observable, TimeoutError, catchError, timeout } from 'rxjs';
import { environment } from '@neom/shared/lib/environments/dev';

@Injectable()
export class BaseApiService<X, Y, Z> {
  public logger: Logger;
  constructor(
    public readonly client: ClientProxy,
    private pattern: string,
    private cacheManagerRef?: Cache
  ) {
    this.logger = new Logger(`${pattern.toUpperCase()}`);
  }

  private __handleError = (req: Request) => {
    return (error: any, caught: Observable<any>): Observable<any> => {
      this.logger.error({ ...error, url: req.url });
      if (error instanceof TimeoutError) {
        throw new HttpException(
          { ...error, message: 'Request Timeout' },
          HttpStatus.REQUEST_TIMEOUT
        );
      }
      switch (error.status) {
        case HttpStatus.BAD_REQUEST:
          throw new HttpException(error, HttpStatus.BAD_REQUEST);
        case HttpStatus.NOT_FOUND:
          throw new HttpException(error, HttpStatus.NOT_FOUND);
        case HttpStatus.BAD_GATEWAY:
          throw new HttpException(error, HttpStatus.BAD_GATEWAY);
        default:
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    };
  };

  get(req: Request, pattern: string, obj: Z): Observable<X[]> {
    return this.client
      .send(pattern, obj)
      .pipe(
        timeout(environment.timeout.get),
        catchError(this.__handleError(req))
      );
  }
  post(req: Request, pattern: string, body: Y): Observable<X> {
    return this.client
      .send(pattern, body)
      .pipe(
        timeout(environment.timeout.post),
        catchError(this.__handleError(req))
      );
  }
  put(req: Request, pattern: string, handler: RequestHandler) {
    return this.client
      .send(pattern, handler)
      .pipe(
        timeout(environment.timeout.put),
        catchError(this.__handleError(req))
      );
  }
  delete(req: Request, pattern: string, handler: RequestHandler) {
    this.client
      .send(pattern, handler)
      .pipe(
        timeout(environment.timeout.delete),
        catchError(this.__handleError(req))
      );
  }
}
