import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service'; // ✅ import PrismaService

@Module({
  providers: [UsersService, PrismaService],
  exports: [UsersService], // ✅ so other modules like AuthModule can use UsersService
})
export class UsersModule {}
