import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentDetailResponseDto } from './dto/payment-response.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({
    summary: 'Create payment for an order (one payment per order)',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiOkResponse({ type: PaymentDetailResponseDto })
  @Post()
  async create(@Req() request: Request, @Body() dto: CreatePaymentDto) {
    const user = request.user as { sub: string };
    return this.paymentsService.create(user.sub, dto);
  }

  @ApiOperation({ summary: 'Get payment by order id (order owner or admin)' })
  @ApiOkResponse({ type: PaymentDetailResponseDto })
  @Get(':orderId')
  async findByOrderId(
    @Req() request: Request,
    @Param('orderId') orderId: string,
  ) {
    const user = request.user as { sub: string; role: UserRole };
    return this.paymentsService.findByOrderId(orderId, user.sub, user.role);
  }
}
