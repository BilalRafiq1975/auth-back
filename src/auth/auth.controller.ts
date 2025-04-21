import { Body, Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute (ttl in milliseconds)
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(
      createUserDto.email,
      createUserDto.name,
      createUserDto.password,
    );
    const token = await this.authService.login(user);
    return { ...user, ...token };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute (ttl in milliseconds)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}