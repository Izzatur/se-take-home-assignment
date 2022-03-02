import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {
    constructor(private readonly botService: BotService) {}

    @Post('add')   
    async create(@Res() res: Response) {
        const result = await this.botService.addBot();
        res.status(HttpStatus.CREATED).send({
            success: result[0],
            message:"Add bot",
            result: result[1]            
        })
    }

    @Delete('delete')   
    async delete(@Res() res: Response) {
        const result = await this.botService.deleteBot();
        res.status(HttpStatus.CREATED).send({
            success: result[0],
            message:"Delete bot",
            result: result[1]            
        })
    }

    @Get('all')
    async getAll(@Res() res: Response) {
        const result = await this.botService.getAllBot();
        res.status(HttpStatus.OK).send({
            success: result[0],
            message:"Get All bot",
            result: result[1]      
        }) 
    }

    @Get('waiting')
    async getWaitingAll(@Res() res: Response) {
        const result = await this.botService.getWaitingBot();
        res.status(HttpStatus.OK).send({
            success: result[0],
            message:"Get Waiting bot",
            result: result[1]      
        }) 
    }

    @Post('byid')
    async getBot(@Body('id') id: number, @Res() res: Response) {
        const result = await this.botService.getBotById(id);
        res.status(HttpStatus.OK).send({
            success: result[0],
            message:"Get bot by id",
            result: result[1]     
        })
    }

    @Patch('update')
    async updateBot(@Body('id') id: number, @Body('status') status: number,
    @Body('orderId') orderId: number, @Res() res: Response) {
        const result = await this.botService.updateBot(id, status, orderId);
        res.status(HttpStatus.OK).send({
            success: result[0],
            message:"Update order by id",
            result: result[1] 
        })
    }
}
