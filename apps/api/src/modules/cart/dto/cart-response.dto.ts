import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty()
  product_id: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  subtotal: number;
}

export class CartDataResponseDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty()
  total_amount: number;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}

export class CartDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: CartDataResponseDto })
  data: CartDataResponseDto;
}
