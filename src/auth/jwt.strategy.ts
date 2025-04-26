import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          const token = request?.cookies?.token;
          if (!token) {
            this.logger.debug('No token found in cookies');
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      this.logger.debug(`Validating JWT payload for email: ${payload.email}`);

      if (!payload.email || !payload.sub) {
        this.logger.error('Invalid JWT payload structure');
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.usersService.findOneByEmail(payload.email);

      if (!user) {
        this.logger.warn(`User not found for email: ${payload.email}`);
        throw new UnauthorizedException('User not found');
      }

      const { password, ...result } = user.toObject?.() || user;
      this.logger.debug(`Successfully validated user: ${result.email}`);
      return result;
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
