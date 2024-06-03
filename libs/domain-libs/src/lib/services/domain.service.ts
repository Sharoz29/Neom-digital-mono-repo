import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RequestHandler } from '@nestjs/common/interfaces';
import { Cache } from 'cache-manager';
import { Observable, TimeoutError, catchError, timeout } from 'rxjs';
import { environment } from '@neom/shared/lib/environments/dev';

export class BaseDomainService<X, Y, Z> {
  public logger: Logger;
  constructor(
    protected readonly client: ClientProxy,
    cacheManagerRef: Cache,
    pattern: string
  ) {
    this.logger = new Logger(`${pattern.toUpperCase()}`);
  }

  get(req: Request, pattern: string, obj: Z): Observable<X[]> {
    return this.client.send(pattern, obj).pipe(
      timeout(environment.timeout.get),
      catchError((error) => {
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
      })
    );
  }
  post(pattern: string, body: Y): Observable<X> {
    return this.client.send(pattern, body);
  }
  put(pattern: string, handler: RequestHandler) {
    this.client.send(pattern, handler);
  }
  delete(pattern: string, handler: RequestHandler) {
    this.client.send(pattern, handler);
  }
}
