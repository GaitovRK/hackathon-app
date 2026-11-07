import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { loadEnv } from './config/env';

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false, bodyParser: false });
  configureApp(app);
  return app;
}

export function configureApp(app: NestExpressApplication): void {
  app.use(helmet());
  app.useBodyParser('json', { limit: '100kb' });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.set('trust proxy', 1);
}

async function bootstrap(): Promise<void> {
  if (existsSync('.env')) process.loadEnvFile('.env'); // local dev; Vercel injects env vars
  const env = loadEnv(); // fail fast before Nest boots
  const app = await createApp();
  await app.listen(env.PORT);
}

if (require.main === module) {
  void bootstrap();
}
