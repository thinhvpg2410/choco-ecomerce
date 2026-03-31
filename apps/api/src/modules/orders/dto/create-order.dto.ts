import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiver_name: string;

  @ApiProperty({ description: 'Phone number in international format, e.g. +84901234567' })
  @Matches(/^\+?[0-9]{9,15}$/, { message: 'receiver_phone format is invalid' })
  receiver_phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shipping_address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payment_method: string;
}
