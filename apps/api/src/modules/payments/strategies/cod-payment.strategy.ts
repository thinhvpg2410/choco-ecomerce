import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import {
  PaymentStrategy,
  PaymentStrategyResult,
} from './payment-strategy.interface';

@Injectable()
export class CodPaymentStrategy implements PaymentStrategy {
  constructor(private readonly prisma: PrismaService) {}

  supports(method: PaymentMethod): boolean {
    return method === PaymentMethod.COD;
  }

  async execute(
    order: any,
    dto: CreatePaymentDto,
  ): Promise<PaymentStrategyResult> {
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể thanh toán cho đơn hàng đã hủy',
      );
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
          amount: order.finalAmount,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      return created;
    });

    return {
      success: true,
      message: 'Vui lòng thanh toán khi nhận hàng',
      payment,
    };
  }
}
