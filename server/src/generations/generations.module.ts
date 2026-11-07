import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { FalService } from '../fal/fal.service';
import { GenerationsController } from './generations.controller';
import { GenerationsService } from './generations.service';

@Module({
  imports: [BillingModule],
  controllers: [GenerationsController],
  providers: [GenerationsService, FalService],
})
export class GenerationsModule {}
