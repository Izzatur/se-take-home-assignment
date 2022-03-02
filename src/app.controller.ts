import { Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

 
  @Get()
    async getHello(@Res() res: Response) {
        const result = await this.appService.getHello();
        res.status(HttpStatus.OK).send({
            message:"Welcome to MCD order System",
            result: result      
        }) 
    }

}
