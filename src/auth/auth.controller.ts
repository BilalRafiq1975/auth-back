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
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Header('Access-Control-Allow-Credentials', 'true')
  async register(@Body() createUserDto: CreateUserDto, @Response() res) {
    const user = await this.authService.register(
      createUserDto.email,
      createUserDto.name,
      createUserDto.password,
      createUserDto.role
    );

    const payload = { email: user.email, sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'none',
      domain: isProduction ? '.railway.app' : 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      message: 'Registration successful',
      user,
      token,
    });
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Header('Access-Control-Allow-Credentials', 'true')
  async login(@Request() req, @Response() res) {
    const user = req.user;
    const payload = { email: user.email, sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'none',
      domain: isProduction ? '.railway.app' : 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: 'Login successful',
      user,
      token,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Header('Access-Control-Allow-Credentials', 'true')
  async getProfile(@Request() req) {
    if (!req.user) {
      throw new Error('User not found, please login again');
    }
    return { user: req.user };
  }

  @Post('logout')
  @Header('Access-Control-Allow-Credentials', 'true')
  async logout(@Response() res) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'none',
      domain: isProduction ? '.railway.app' : 'localhost',
    });
    return res.status(200).json({ message: 'Logout successful' });
  }
}
