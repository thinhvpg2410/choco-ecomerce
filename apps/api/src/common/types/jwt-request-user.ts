import { UserRole, UserStatus } from '@prisma/client';

export type JwtRequestUser = {
  sub: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};
