import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty()
  @IsUUID('4')
  product_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  variant_id?: string;

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
