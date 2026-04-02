import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  order_id?: string;

  @ApiPropertyOptional({ description: 'Cart or order subtotal for preview (no order_id)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;
}
