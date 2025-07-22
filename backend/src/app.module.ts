import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SocketGateway } from './socket/socket.gateway';
import { PrismaService } from './prisma.service'; // 👈 Import PrismaService
import { UsersService } from './users/users.service'; // 👈 Add UsersService if not in AuthModule

@Module({
  imports: [AuthModule],
  providers: [SocketGateway, PrismaService, UsersService], // 👈 Register it here
})
export class AppModule {}

