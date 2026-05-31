import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import {
  PaymentStrategy,
  PaymentStrategyResult,
} from './payment-strategy.interface';

@Injectable()
export class PaypalPaymentStrategy implements PaymentStrategy {
  constructor(private readonly prisma: PrismaService) {}

  supports(method: PaymentMethod): boolean {
    return method === PaymentMethod.PayPal;
  }

  async execute(
    order: any,
    dto: CreatePaymentDto,
  ): Promise<PaymentStrategyResult> {
    if (!dto.transaction_code) {
      throw new BadRequestException(
        'transaction_code is required for PayPal payment',
      );
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const orderInTx = await tx.order.findFirst({
        where: { id: order.id, userId: order.userId },
      });

      if (!orderInTx) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      if (orderInTx.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(
          'Không thể thanh toán cho đơn hàng đã hủy',
        );
      }

      const created = await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: PaymentMethod.PayPal,
          paymentStatus: PaymentStatus.PAID,
          amount: orderInTx.finalAmount,
          transactionCode: dto.transaction_code,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      });

      return created;
    });

    return {
      success: true,
      message: 'Thanh toán PayPal đã hoàn tất',
      payment,
    };
  }
}
