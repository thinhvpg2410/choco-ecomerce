import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Matches `apps/web/types/type.ts` Coupon */
export class CouponDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ description: '0–100; 0 when discount_amount is used' })
  discount_percent: number;

  @ApiPropertyOptional({
    description: 'Fixed amount off when coupon type is FIXED',
  })
  discount_amount?: number;

  @ApiProperty()
  min_order_amount: number;

  @ApiProperty()
  max_discount_amount: number;

  @ApiProperty()
  usage_limit: number;

  @ApiProperty()
  used_count: number;

  @ApiProperty({ description: 'ISO date string; empty when no expiry' })
  expiry_date: string;

  @ApiProperty({ description: 'ISO string' })
  created_at: string;

  @ApiPropertyOptional()
  is_active?: boolean;
}

export class CouponListResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [CouponDataDto] })
  data: CouponDataDto[];
}

export class CouponDetailResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: CouponDataDto })
  data: CouponDataDto;
}

export class ApplyCouponDataDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  discount_amount: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  final_amount: number;
}

export class ApplyCouponResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ApplyCouponDataDto })
  data: ApplyCouponDataDto;
}
