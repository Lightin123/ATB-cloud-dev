import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      id: 1,
      email: 'test@example.com',
      // bcrypt hash for "123456"
      password: '$2b$10$TG44P1/F3MYwA9ZsL1bKz.rSnE7DquNfA9q9uq8nlUs2c6sJdCqzS',
    },
  ];

  async findByEmail(email: string) {
    return this.users.find(user => user.email === email);
  }
}
