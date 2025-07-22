// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthController } from 'C:\\ATB-local-testing-dev\\backend\\src\\auth\\auth.controller';
import { AuthService } from 'C:\\ATB-local-testing-dev\\backend\\src\\auth\\auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule], 
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}