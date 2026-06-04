import { IsString, IsUUID } from 'class-validator';

export class CreateUserAddressDto {
  // @IsUUID()
  // userId: string;

  @IsString()
  receiverName: string;

  @IsString()
  receiverPhone: string;

  @IsString()
  address: string;

  @IsString()
  ward: string;

  @IsString()
  city: string;
}
