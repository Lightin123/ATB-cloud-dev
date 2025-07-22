import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SocketGateway } from './socket/socket.gateway';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module'; // ✅ import UsersModule

@Module({
  imports: [AuthModule, UsersModule], // ✅ import UsersModule here
  providers: [SocketGateway],
})
export class AppModule {}
