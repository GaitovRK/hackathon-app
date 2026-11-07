import { Controller, Get } from '@nestjs/common';
import { STARTER_CATALOG, type StarterItem } from './catalog';
import { LOOKS, type Look } from './looks';

/** Static content: the starter basics and the onboarding looks. Same for every user; the app filters by wardrobe. */
@Controller('starter-catalog')
export class StarterCatalogController {
  @Get()
  get(): { items: StarterItem[]; looks: Look[] } {
    return { items: STARTER_CATALOG, looks: LOOKS };
  }
}
