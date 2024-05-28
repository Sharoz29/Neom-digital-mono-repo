import { MessagePatterns, RMQQueues } from '@neom/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from "@nestjs/microservices";
import { Observable } from 'rxjs';
@Injectable()

export class AppService {
  constructor(@Inject(RMQQueues.PY_WORKER_QUEUE) private readonly rmqClient: ClientProxy) {

  }
  getData(): Observable<{ message: string }> {
    return this.rmqClient.send({ cmd: `${MessagePatterns.PY_HOST_INFO}` }, {});
  }
}
