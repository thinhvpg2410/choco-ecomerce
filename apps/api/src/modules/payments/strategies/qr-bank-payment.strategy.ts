import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import {
  PaymentStrategy,
  PaymentStrategyResult,
} from './payment-strategy.interface';

@Injectable()
export class QrBankPaymentStrategy implements PaymentStrategy {
  constructor(private readonly prisma: PrismaService) {}

  supports(method: PaymentMethod): boolean {
    return method === PaymentMethod.QR_BANK;
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

    const result = await this.prisma.$transaction(async (tx) => {
      const orderInTx = await tx.order.findFirst({
        where: { id: order.id, userId: order.userId },
      });

      if (!orderInTx) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      const transactionCode = `DH${orderInTx.id.split('-')[0].toUpperCase()}`;

      const payment = await tx.payment.upsert({
        where: { orderId: orderInTx.id },
        update: {
          transactionCode,
          paymentMethod: PaymentMethod.QR_BANK,
          paymentStatus: PaymentStatus.PENDING,
        },
        create: {
          orderId: orderInTx.id,
          paymentMethod: PaymentMethod.QR_BANK,
          paymentStatus: PaymentStatus.PENDING,
          amount: orderInTx.finalAmount,
          transactionCode,
        },
      });

      await tx.order.update({
        where: { id: orderInTx.id },
        data: { paymentStatus: PaymentStatus.PENDING },
      });

      const qrUrl =
        `https://img.vietqr.io/image/MB-0961439551-compact2.png` +
        `?amount=${Number(orderInTx.finalAmount)}` +
        `&addInfo=${transactionCode}` +
        `&accountName=CHOCOSHOP`;

      return { payment, qrUrl };
    });

    return {
      success: true,
      message: 'Tạo thanh toán QR thành công',
      payment: result.payment,
      extra: { qr_url: result.qrUrl },
    };
  }
}
