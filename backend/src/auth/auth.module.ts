// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthController } from 'C:\\ATB-local-testing-dev\\frontend\\src\\auth\\auth.controller.ts';
import { AuthService } from 'C:\\ATB-local-testing-dev\\frontend\\src\\auth\\auth.service.ts';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
