import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { ConfigModule } from './config/config.module';
import { GenerationsModule } from './generations/generations.module';
import { HealthController } from './health.controller';
import { ItemsModule } from './items/items.module';
import { OutfitsModule } from './outfits/outfits.module';
import { PrismaModule } from './prisma/prisma.module';
import { StarterCatalogModule } from './starter-catalog/starter-catalog.module';
import { StyleProfileModule } from './style-profile/style-profile.module';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    BillingModule,
    GenerationsModule,
    StarterCatalogModule,
    StyleProfileModule,
    ItemsModule,
    OutfitsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
