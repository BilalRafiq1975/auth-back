// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../users/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'Asdfghjklpoiuytrewq1975@',
    });
  }

  async validate(payload: any): Promise<any> {
    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      return null;
    }
    const { password, ...result } = user.toObject();
    return result;
  }
}