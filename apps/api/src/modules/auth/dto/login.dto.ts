import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuestCartItemDto } from '../../cart/dto/guest-cart-item.dto';

export class LoginDto {
  @ApiProperty({ example: 'admin@choco.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    type: [GuestCartItemDto],
    description:
      'Optional guest cart from localStorage/session. Merged into the user cart after successful login.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  guestCart?: GuestCartItemDto[];
}
