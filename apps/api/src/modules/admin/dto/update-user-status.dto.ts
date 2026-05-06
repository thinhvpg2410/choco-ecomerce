import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, description: 'Trạng thái người dùng mới' })
  @IsEnum(UserStatus)
  status: UserStatus;
}
