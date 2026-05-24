import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_id: string;

  @ApiProperty({ description: 'e.g. COD | BANKING' })
  payment_method: string;

  @ApiProperty({ enum: ['PENDING', 'PAID'] })
  payment_status: 'PENDING' | 'PAID';

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
