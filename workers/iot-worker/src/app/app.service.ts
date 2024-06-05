import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { topic: string } {
    return { topic: '#' };
  }
}
