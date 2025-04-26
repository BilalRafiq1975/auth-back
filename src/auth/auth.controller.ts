import { Body, Controller, Post, UseGuards, Request, Get, Response, Header } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { Throttle } from '@nestjs/throttler';
import { Public } from './decorator/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute (ttl in milliseconds)
  @Header('Access-Control-Allow-Credentials', 'true')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(
      createUserDto.email,
      createUserDto.name,
      createUserDto.password,
    );
    const token = await this.authService.login(user);
    return { ...user, ...token };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute (ttl in milliseconds)
  @Header('Access-Control-Allow-Credentials', 'true')
  async login(@Request() req, @Response() res) {
    const user = await this.authService.login(req.user);
    const payload = { email: req.user.email, sub: req.user._id };
    const token = this.jwtService.sign(payload);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({ message: 'Login successful', user });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Header('Access-Control-Allow-Credentials', 'true')
  getProfile(@Request() req) {
    if (!req.user) {
      throw new Error('User data not found. Please login again');
    }
    return { user: req.user }; // Return the authenticated user data
  }
}
