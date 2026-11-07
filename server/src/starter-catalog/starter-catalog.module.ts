import { Module } from '@nestjs/common';
import { StarterCatalogController } from './starter-catalog.controller';

@Module({ controllers: [StarterCatalogController] })
export class StarterCatalogModule {}
