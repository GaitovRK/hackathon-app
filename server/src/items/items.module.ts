import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { FalService } from '../fal/fal.service';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  imports: [BillingModule],
  controllers: [ItemsController],
  providers: [ItemsService, FalService],
  exports: [ItemsService],
})
export class ItemsModule {}
