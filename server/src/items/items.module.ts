import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  imports: [BillingModule],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
