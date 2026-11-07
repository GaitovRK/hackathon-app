import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ENV, type Env } from '../config/env';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ENV],
      useFactory: (env: Env) => ({ secret: env.JWT_SECRET, signOptions: { expiresIn: '365d' } }),
    }),
  ],
  controllers: [AuthController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AuthModule {}
