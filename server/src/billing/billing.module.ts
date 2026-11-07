import { Module } from '@nestjs/common';
import { EntitlementService } from './entitlement.service';
import { MeController } from './me.controller';
import { QuotaService } from './quota.service';

@Module({
  controllers: [MeController],
  providers: [EntitlementService, QuotaService],
  exports: [QuotaService, EntitlementService],
})
export class BillingModule {}
