import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          const token = request?.cookies?.token;
          console.log('Extracted Token from Cookies:', token); // Debug log
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);

    const user = await this.usersService.findOneByEmail(payload.email);

    if (!user) {
      console.log('User not found for email:', payload.email);
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user.toObject?.() || user;
    console.log('Validated user:', result);
    return result;
  }
}
