// src/modules/paypal/dto/create-paypal-order.dto.ts
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePayPalOrderDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsString()
  description?: string;
}
