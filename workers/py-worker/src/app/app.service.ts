import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(id?): { message: string } {
    return { message: `Hello from PY Worker: ${id}` };
  }
}
