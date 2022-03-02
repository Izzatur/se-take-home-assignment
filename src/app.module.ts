import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { BotModule } from './bot/bot.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [OrderModule, BotModule],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
