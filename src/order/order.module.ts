import { forwardRef, Module } from '@nestjs/common';
import { AppGateway } from 'src/app.gateway';
import { BotModule } from 'src/bot/bot.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [forwardRef(() => BotModule)],
  exports: [OrderService],
  controllers: [OrderController],
  providers: [OrderService, AppGateway]
})
export class OrderModule {}
