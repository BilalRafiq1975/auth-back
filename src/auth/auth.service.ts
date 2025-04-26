import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      this.logger.debug(`Validating user with email: ${email}`);
      const user = await this.usersService.validateUser(email, password);
      
      if (user) {
        const { password, ...result } = user.toObject();
        this.logger.debug(`User validated successfully: ${email}`);
        return result;
      }
      
      this.logger.warn(`Invalid credentials for user: ${email}`);
      return null;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: User) {
    try {
      this.logger.debug(`Processing login for user: ${user.email}`);
      
      const payload = { 
        email: user.email, 
        sub: user._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      };
      
      const userObject = user.toObject ? user.toObject() : user;
      const { password, ...userWithoutPassword } = userObject;
      
      this.logger.debug(`Login successful for user: ${user.email}`);
      return {
        user: {
          id: userWithoutPassword._id,
          name: userWithoutPassword.name,
          email: userWithoutPassword.email
        }
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      throw new UnauthorizedException('Login failed');
    }
  }

  async register(email: string, name: string, password: string) {
    try {
      this.logger.debug(`Processing registration for user: ${email}`);
      
      // Check if user already exists
      const existingUser = await this.usersService.findOne(email);
      if (existingUser) {
        this.logger.warn(`Registration failed: Email already exists: ${email}`);
        throw new ConflictException('Email already exists');
      }

      const user = await this.usersService.create(email, name, password);
      const { password: _, ...result } = user.toObject();
      
      this.logger.debug(`Registration successful for user: ${email}`);
      return result;
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Registration failed');
    }
  }
}