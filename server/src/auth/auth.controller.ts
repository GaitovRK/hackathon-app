import { Controller, HttpCode, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('anonymous')
  @HttpCode(201)
  async anonymous(): Promise<{ token: string; userId: string }> {
    const user = await this.prisma.user.create({ data: {} });
    const token = await this.jwt.signAsync({ sub: user.id });
    return { token, userId: user.id };
  }
}
