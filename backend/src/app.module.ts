import { Module } from '@nestjs/common';
import { AuthController } from 'C:\\ATB-local-testing-dev\\backend\\src\\auth\\auth.controller';
import { AuthService } from 'C:\\ATB-local-testing-dev\\backend\\src\\auth\\auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
