import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  ping() {
    return { message: 'Auth controller is live!' };
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }
}