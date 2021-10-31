import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(name: string): any {
    var home;
    var count = 1;
    if (true) {
      count += 1;
    }
    const item = new Object();
    return 'Hello World!';
  }
}
