import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class GuestCartItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  product_id: string;

  @ApiProperty({ minimum: 1, description: 'Must be a positive integer' })
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  quantity: number;
}
