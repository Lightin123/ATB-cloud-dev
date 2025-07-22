// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(body: { email: string; password: string }) {
    const { email, password } = body;

    // Dummy logic — replace this with your real login logic
    if (email === 'admin@example.com' && password === '1234') {
      return { message: 'Login successful', token: 'jwt_token_here' };
    }

    return { message: 'Invalid credentials' };
  }
}
