import { Injectable } from '@nestjs/common';
import { PrismaService } from 'C:\\ATB-local-testing-dev\\backend\\src\\prisma.service'; // adjust the path if needed

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
