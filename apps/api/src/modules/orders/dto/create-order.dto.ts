import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiver_name: string;

  @ApiProperty({
    description: 'Phone number in international format, e.g. +84901234567',
  })
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Selected cart item IDs to create order from',
  })
  @IsOptional()
  @IsString({ each: true })
  cart_item_ids?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paypal_order_id?: string;

  @ApiProperty({
    required: false,
    description: 'True khi mua ngay, bỏ qua giỏ hàng',
  })
  @IsOptional()
  @IsBoolean()
  buy_now?: boolean;

  @ApiProperty({ required: false, description: 'Product ID khi mua ngay' })
  @ValidateIf((o) => o.buy_now === true)
  @IsUUID()
  @IsNotEmpty()
  product_id?: string;

  @ApiProperty({
    required: false,
    description: 'Số lượng khi mua ngay',
    minimum: 1,
  })
  @ValidateIf((o) => o.buy_now === true)
  @IsNumber()
  @Min(1)
  quantity?: number;
}
