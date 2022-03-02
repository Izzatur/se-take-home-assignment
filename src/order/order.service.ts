import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AppGateway } from 'src/app.gateway';
import { BotService } from 'src/bot/bot.service';

var order = [], 
count = 0;

@Injectable()
export class OrderService {
    constructor(
        @Inject(forwardRef(() => BotService))
        private botService: BotService,
        private appGateway: AppGateway
    ) {}

    async createOrder(vip: boolean): Promise<[boolean, any]> {
        if (vip != null) {
            try {                         
                let obj = {
                    id: ++count,
                    status: 'Pending',
                    isVip: vip
                } 
                order.push(obj);
                await this.emitOrder(); // emit order to socket io            
                let bots = await this.botService.getWaitingBot(); // get bot available                              
                if (bots[0] === true && bots[1].length > 0) {
                    let bot = bots[1];
                    this.botService.assignTask(bot[0].id); // get pending order and assign to bot 
                }                      
                return ([true, order]);                                                                 
            } catch (error) {
                console.log(error);
                return ([false, error]);
            }
        }
        else
            return ([false, 'null order not submitted']);
    }    

    async getAllOrder(): Promise<[boolean, any]> {
        try {
            var vip = [],
            normal = [],
            preparing = [],
            completedVip = [],
            completedNormal = [];            
            for (var i in order) {
                if (order[i].isVip === true && order[i].status === 'Pending') {
                    vip.push(order[i]);
                } else if (order[i].isVip === false && order[i].status === 'Pending') {
                    normal.push(order[i]);
                } else if (order[i].status === 'Preparing') {
                    preparing.push(order[i]);
                } else if (order[i].status === 'Completed' && order[i].isVip === true) {
                    completedVip.push(order[i]);
                } else if (order[i].status === 'Completed' && order[i].isVip === false) {
                    completedNormal.push(order[i]);
                }                                                 
            }
            var orders = {
                vip: vip,
                normal: normal,
                preparing: preparing,
                completedVip: completedVip,
                completedNormal: completedNormal
            };
            return ([true, orders]);                                                                 
        } catch (error) {
            console.log(error);
            return ([false, error]);
        }
    }
    
    async getPendingOrder(): Promise<[boolean, any]> {
        try {
            var vip = [],
            normal = [];
            for (var i in order) {
                if (order[i].isVip === true && order[i].status === 'Pending') {
                    vip.push(order[i]);
                } else if (order[i].isVip === false && order[i].status === 'Pending') {
                    normal.push(order[i]);
                }                                            
            }
            var orders = {
                vip: vip,
                normal: normal,
            };
            return ([true, orders]);                                                                 
        } catch (error) {
            console.log(error);
            return ([false, error]);
        }
    }

    async getOrderById(id: number): Promise<[boolean, any]> {
        try {    
            var found = false;
            for (var i in order) {
                if (order[i].id === id) {
                    found = true;
                    return ([true, order[i]]);                    
                }                                            
            }
            if (found == false) {
                return ([false, 'order not found']);
            }                                                                       
        } catch (error) {
            console.log(error);
            return ([false, error]);
        }
    }

    async updateOrder(id: number, status: string): Promise<[boolean, any]> {
        try {    
            var found = false;
            for(var i = 0; i < order.length; i++) {
                if (order[i].id === id) {
                    found = true;
                    order[i].status = status;
                    return ([true, order[i]]);                    
                }                                            
            }
            if (found == false) {
                return ([false, 'order not found, cannot update']);
            }                                                                   
        } catch (error) {
            console.log(error);
            return ([false, error]);
        }
    }

    async emitOrder() {
        try {
            let allOrder = await this.getAllOrder(); // get all order
            if (allOrder[0]) {
                this.appGateway.sendOrder(allOrder[1]); // emit all order to socket io client
            } 
        } catch (error) {
            console.log(error);                
        }
    }
}
