import { forwardRef, Module } from '@nestjs/common';
import { AppGateway } from 'src/app.gateway';
import { OrderModule } from 'src/order/order.module';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';

@Module({
  imports: [forwardRef(() => OrderModule)],
  exports: [BotService],
  controllers: [BotController],
  providers: [BotService, AppGateway]
})
export class BotModule {}
