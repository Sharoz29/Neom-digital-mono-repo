import { RMQQueues } from '@neom/shared';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, NestMiddleware, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, from, lastValueFrom, of, tap } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { PSAPPLICATION } from '@neom/models';
import { environment } from '@neom/shared/lib/environments/dev';

export class DxVersioningMiddleware implements NestMiddleware {
  public readonly _client: ClientProxy;
  public readonly cacheManagerRef: Cache;
  public readonly _httpService: HttpService;

  constructor(
    private readonly httpService: HttpService,
    @Inject(RMQQueues.PY_WORKER_QUEUE) _client: ClientProxy,
    @Inject(CACHE_MANAGER) cacheManagerRef: Cache
  ) {
    this._client = _client;
    this.cacheManagerRef = cacheManagerRef;
    this._httpService = httpService;
  }

  use(req: any, res: any, next: () => void) {
    return from(
      lastValueFrom(
        this.httpService
          .get(
            environment.apiUrl + environment.APPLICATIONS + environment.VERSION,
            {
              headers: req.headers,
            }
          )
          .pipe(
            tap((response: any) => {
              const data = response.data;
              const version = data.pyIsConstellationApp ? 'v2' : 'v1';
              req.headers['dxApiVersion'] = version;
              next();
            })
          )
      )
    );
  }
}
