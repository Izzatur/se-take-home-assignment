import { Body, Controller, Get, HttpStatus, Patch, Post, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { Response } from 'express';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post('create')   
    async create(@Body('vip') vip: boolean, @Res() res: Response) {
        const result = await this.orderService.createOrder(vip);
        res.status(HttpStatus.CREATED).send({
        success: result[0],
        message:"Create order",
        result: result[1]            
        })
    }

    @Get('all')
    async getAll(@Res() res: Response) {
        const result = await this.orderService.getAllOrder();
        res.status(HttpStatus.OK).send({
            success: result[0],
            message:"Get All order",
            result: result[1]      
        }) 
    }

    @Get('pending')
    async getPendingAll(@Res() res: Response) {
        const result = await this.orderService.getPendingOrder();
        res.status(HttpStatus.OK).send({
            success: result[0],
            message:"Get Pending order",
            result: result[1]      
        }) 
}

    @Post('byid')
    async getOrder(@Body('id') id: number, @Res() res: Response) {
        const result = await this.orderService.getOrderById(id);
        res.status(HttpStatus.OK).send({
            success: result[0],
            message:"Get order by id",
            result: result[1]     
        })
    }

    @Patch('update')
    async updateOrder(@Body('id') id: number, @Body('status') status: string, @Res() res: Response) {
        const result = await this.orderService.updateOrder(id, status);
        res.status(HttpStatus.OK).send({
            success: result[0],
            message:"Update order by id",
            result: result[1] 
        })
    }
}
