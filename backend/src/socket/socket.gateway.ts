import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Or restrict to your frontend origin
    credentials: true,
  },
})
export class SocketGateway {
  @WebSocketServer()
  server!: Server; // ✅ Add "!" to tell TypeScript this will be initialized by the framework

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any) {
    console.log('📡 Ping received:', data);
    this.server.emit('pong', { message: 'pong from server' });
  }
}
