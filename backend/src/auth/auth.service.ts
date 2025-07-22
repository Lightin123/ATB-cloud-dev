import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(body: { email: string; password: string }) {
    try {
      const { email, password } = body;
      console.log('📨 Login request:', email);

      const user = await this.usersService.findByEmail(email);
      console.log('🔎 User found:', user);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🔐 Password match:', isMatch);

      if (!isMatch) {
        throw new UnauthorizedException('Wrong password');
      }

      return {
        message: 'Login successful',
        user: { id: user.id, email: user.email },
      };
    } catch (err) {
      console.error('❌ Login error:', err);
      // Optional: wrap unexpected errors
      throw err instanceof UnauthorizedException ? err : new InternalServerErrorException('Login failed');
    }
  }
}
