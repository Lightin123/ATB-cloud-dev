import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SocketGateway } from './socket/socket.gateway'; // 👈 Add this

@Module({
  imports: [AuthModule],
  providers: [SocketGateway], // 👈 Register the gateway
})
export class AppModule {}
