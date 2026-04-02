import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderItemResponseDto {
  @ApiProperty()
  product_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;
}

export class OrderDataResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  total_amount: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  receiver_name: string;

  @ApiProperty()
  receiver_phone: string;

  @ApiProperty()
  shipping_address: string;

  @ApiProperty()
  payment_method: string;

  @ApiProperty()
  createdAt: Date;
}

export class OrderDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: OrderDataResponseDto })
  data: OrderDataResponseDto;
}

export class OrderListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [OrderDataResponseDto] })
  data: OrderDataResponseDto[];
}
