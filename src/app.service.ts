import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {  

  async getHello(): Promise<string> {
    return new Promise(resolve => 
      setTimeout(() => resolve('Hello World after 3 seconds'), 3000)
    );
  }
}
