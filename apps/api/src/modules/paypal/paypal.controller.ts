
import { PayPalService } from './paypal.service';
import { CreatePayPalOrderDto } from './dto/create-paypal-order.dto';
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Controller('paypal')
export class PayPalController {
  constructor(private readonly paypalService: PayPalService) {}

  @Post('create-order')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createOrder(@Body() dto: CreatePayPalOrderDto) {
    return this.paypalService.createOrder(dto);
  }

  @Post('capture-order')
  async captureOrder(@Body() body: { orderId: string }) {
    return this.paypalService.captureOrder(body.orderId);
  }
}


