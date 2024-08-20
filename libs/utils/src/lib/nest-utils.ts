
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { Request } from "express";

export function buildRMQRecord(req: any, data: any) {
  return new RmqRecordBuilder(data)
    .setOptions({
      headers: {
        $c: (<any>req.query)?.$c,
        ...req.headers,
      },
      priority: 3,
    })
    .build();
}
