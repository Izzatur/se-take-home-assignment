import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AppGateway } from 'src/app.gateway';
import { OrderService } from 'src/order/order.service';

var bot = [], 
count = 0;

@Injectable()
export class BotService {
    constructor(
        @Inject(forwardRef(() => OrderService))
        private orderService: OrderService,
        private appGateway: AppGateway
    ) {}

    async addBot(): Promise<[boolean, any]> {
        try {                         
            let obj = {
                id: ++count,
                status: 0, // status 0 bot in waiting for task                    
                orderId: 0 // as a foreign key for Order Id
            }
            bot.push(obj);
            await this.emitBot(); // emit bot to socket io    
            this.assignTask(obj.id); //get pending order and assign to bot
            return ([true, bot]);                                                         
        } catch (error) {
            console.log(error);
            return ([false, error]);
        }
    }

    async deleteBot(): Promise<[boolean, any]> {
        try {  
            //get Bot status
            if(bot.length > 0) {
                let newestBot = bot[bot.length - 1];                
                if (newestBot.status === 1) {
                    let task = await this.reAssignTask(newestBot.orderId); //reassign task order to other bot
                    if (task[0]) {
                        bot.pop();
                        count--;
                        await this.emitBot(); // emit bot to socket io
                    } 
                    return ([task[0], task[1]]);                    
                } else if (newestBot.status === 0) {
                    //just delete the bot
                    bot.pop();
                    count--;
                    await this.emitBot(); // emit bot to socket io 
                    return ([true, bot]);
                }
            }           
        } catch (error) {
            return ([false, error]);
        }
    }        

    async assignTask(id: number): Promise<[boolean, any]> {
        try {  
            var vip = [],
            normal = [];                              
            let pending = await this.orderService.getPendingOrder(); // get pending task      
            if (pending[0]) {
                vip = pending[1].vip;
                normal = pending[1].normal;
                if (vip.length > 0 ) {  
                    await this.assignTaskCont(id, vip[0].id); // call continue function for assign task
                  
                } else if (normal.length > 0) {
                    await this.assignTaskCont(id, normal[0].id); // call continue function for assign task
                                                  
                } else {
                    console.log('Bot id: ' + id +' No Pending order');                    
                    return ([false, 'No pending order']);
                }                    
            }
        } catch (error) {
            console.log('Bot id: ' + id + ' ' + error);
            return ([false, error]);
        }
    }

    async assignTaskCont(id: number, orderId: number): Promise<[boolean, any]> {
        try {                             
            let upt = await this.updateBot(id, 1, orderId);  // update bot status = 1 (working)
            if (upt[0]) {
                await this.emitBot(); // emit bot to socket io     
                let uptProcess = await this.orderService.updateOrder(orderId, 'Preparing'); //update order to Preparing                        
                if (uptProcess[0]) {
                    console.log('Bot id: ' + id +' Preparing order: ' + orderId);
                    await this.orderService.emitOrder(); // emit order to socket io                                                
                    await this.delay(20000); // delay in 10 seconds
                    let getBot = await this.getBotById(id); // check if the bot still exist
                    if (getBot[0]) {
                        await this.orderService.updateOrder(orderId, 'Completed'); // update order to completed 
                        await this.updateBot(id, 0, 0); // update bot status to waiting
                        await this.emitBot(); // emit bot to socket io    
                        console.log('Bot id: ' + id +' Completed order: ' + orderId);    
                        await this.orderService.emitOrder(); // emit order to socket io                                                          
                        await this.assignTask(id);     
                    } else {
                        console.log('Bot id: ' + id + ' already deleted');
                        return ([false, getBot[1]]);                            
                    }                                 
                } else {
                    await this.updateBot(id, 0, 0);
                    await this.emitBot(); // emit bot to socket io    
                    console.log('Bot id: ' + id + ' ' + uptProcess[1]);
                    return ([false, uptProcess[1]]);
                }
            } else {
                console.log('Bot id: ' + id + ' ' + upt[1]);
                return ([false, upt[1]]);
            }                                                            
        } catch (error) {
            console.log('Bot id: ' + id + ' ' + error);
            return ([false, error]);
        }
    }

    async reAssignTask(orderId: number): Promise<[boolean, any]> {
        try {  
            let updateOrder = await this.orderService.updateOrder(orderId, 'Pending');
            if (updateOrder[0]) {
                await this.orderService.emitOrder(); // emit order to socket io              
                let bots = await this.getWaitingBot();                
                if (bots[0] === true && bots[1].length > 0) {
                    let waitingBot = bots[1];
                    this.assignTask(waitingBot[0].id); //get pending order and assign to bot                     
                    return ([true, 'reassign order number: ' + orderId + ' to Bot id: ' + waitingBot[0].id]);
                } else {
                    return  ([true, 'reassign order number: ' + orderId + ' to other Bot that available']);
                }
            } else {
                return ([false, updateOrder[1]]);
            }            
        } catch (error) {
            console.log('Bot id: ' + orderId + ' ' + error);
            return ([false, error]);
        }
    }

    async emitBot() {
        try {
            let allBot = await this.getAllBot(); // get all bot
            if (allBot[0]) {
                this.appGateway.sendBot(allBot[1]); // emit all bot to socket io client admin
            } 
        } catch (error) {
            console.log(error);                
        }
    }

    async delay(ms: number) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }

    async getBotById(id: number): Promise<[boolean, any]> {
        try {    
            var found = false;
            for (var i in bot) {
                if (bot[i].id === id) {
                    found = true;
                    return ([true, bot[i]]);                    
                }                                            
            }
            if (found == false) {
                return ([false, 'bot not found']);
            }                                                                       
        } catch (error) {
            console.log(error);
            return ([false, error]);
        }
    }
        
    async getAllBot(): Promise<[boolean, any]> {
        try {
            var waiting = [],
            working = [];
            for (var i in bot) {
                if (bot[i].status === 0) {
                    waiting.push(bot[i]);
                } else if (bot[i].status === 1) {
                    working.push(bot[i]);
                }                                                   
            }
            var bots = {
                waiting: waiting,
                working: working
            };
            return ([true, bots]);                                                                 
        } catch (error) {
            console.log(error);
            return ([false, error]);
        }
    }
    
    async getWaitingBot(): Promise<[boolean, any]> {
        try {
            var waiting = [];
            for (var i in bot) {
                if (bot[i].status === 0) {
                    waiting.push(bot[i]);
                }                                           
            }            
            return ([true, waiting]);                                                                 
        } catch (error) {
            console.log(error);
            return ([false, error]);
        }
    }

    async updateBot(id: number, status: number, orderId: number): Promise<[boolean, any]> {
        try {    
            var found = false;
            for(var i = 0; i < bot.length; i++) {
                if (bot[i].id === id) {
                    found = true;
                    bot[i].status = status;
                    bot[i].orderId = orderId;                    
                    return ([true, bot[i]]);                    
                }                                            
            }
            if (found == false) {
                return ([false, 'bot not found, cannot update']);
            }                                                                   
        } catch (error) {
            console.log(error);
            return ([false, error]);
        }
    }
}
