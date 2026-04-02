import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Matches `apps/web/types/type.ts` Payment */
export class PaymentDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_id: string;

  @ApiProperty({ description: 'e.g. COD | BANKING' })
  payment_method: string;

  @ApiProperty({ enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] })
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

  @ApiPropertyOptional()
  transaction_code?: string;

  @ApiProperty()
  amount: number;

  @ApiPropertyOptional({ description: 'ISO string when payment is PAID' })
  paid_at?: string;

  @ApiProperty({ description: 'ISO string' })
  created_at: string;
}

export class PaymentDetailResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: PaymentDataDto })
  data: PaymentDataDto;
}
