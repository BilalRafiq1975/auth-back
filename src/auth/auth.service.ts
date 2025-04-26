import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(email, password);
    if (user) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user._id };
    const userObject = user.toObject ? user.toObject() : user;
    const { password, ...userWithoutPassword } = userObject;
    return {
      user: {
        id: userWithoutPassword._id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email
      }
    };
  }

  async register(email: string, name: string, password: string) {
    // Check if user already exists
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create(email, name, password);
    const { password: _, ...result } = user.toObject();
    return result;
  }
}