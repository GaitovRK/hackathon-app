import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { StyleProfileModule } from '../style-profile/style-profile.module';
import { OutfitsController } from './outfits.controller';
import { OutfitsService } from './outfits.service';

@Module({
  imports: [BillingModule, StyleProfileModule],
  controllers: [OutfitsController],
  providers: [OutfitsService],
})
export class OutfitsModule {}
