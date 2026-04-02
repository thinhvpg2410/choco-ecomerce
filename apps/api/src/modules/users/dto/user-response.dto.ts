import { UserRole, UserStatus } from '@prisma/client';

export class UserResponseDto {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}
