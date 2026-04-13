import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  dob?: string;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  avatar_url?: string;
}
