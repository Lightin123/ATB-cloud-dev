import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'https://symphonious-concha-d286d8.netlify.app'
];

const devOrigin = process.env.DEV_FRONTEND_URL;
const prodOrigin = process.env.PROD_FRONTEND_URL;

const ALLOWED_ORIGINS = [
  ...DEFAULT_ORIGINS,
  devOrigin,
  prodOrigin
].filter(Boolean); // removes undefined/null

class CorsIoAdapter extends IoAdapter {
  constructor(private app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const cors = {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    };
    return super.createIOServer(port, { ...(options || {}), cors });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  });

  app.useWebSocketAdapter(new CorsIoAdapter(app));

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
