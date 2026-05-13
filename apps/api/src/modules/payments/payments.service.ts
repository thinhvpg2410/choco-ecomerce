import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePaymentDto) {
    this.assertUuid(userId, 'User not found');
    this.assertUuid(dto.order_id, 'Order not found');

    const order = await this.prisma.order.findUnique({
      where: { id: dto.order_id },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You cannot pay for this order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }

    if (order.payment) {
      if (
        order.payment.paymentStatus === PaymentStatus.PENDING &&
        order.payment.paymentMethod === PaymentMethod.BANKING &&
        dto.payment_method === PaymentMethod.BANKING &&
        dto.transaction_code
      ) {
        return this.finalizePendingBankingPayment(
          order.id,
          userId,
          dto.transaction_code,
        );
      }
      throw new ConflictException('Payment already exists for this order');
    }

    if (dto.payment_method === PaymentMethod.COD) {
      return this.completeCodPayment(order.id);
    }

    if (dto.payment_method === PaymentMethod.BANKING) {
      return this.createPendingBankingPayment(order.id, order.totalAmount);
    }

    if (dto.payment_method === PaymentMethod.PayPal) {
      return this.createCompletedPaypalPayment(
        order.id,
        userId,
        dto.transaction_code!,
      );
    }

    throw new BadRequestException('Unsupported payment flow');
  }

  async findByOrderId(
    orderId: string,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    this.assertUuid(orderId, 'Order not found');
    this.assertUuid(requesterId, 'User not found');

    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const isOwner = payment.order.userId === requesterId;
    const isAdmin = requesterRole === UserRole.admin;

    if (!isOwner && !isAdmin) {
      throw new NotFoundException('Payment not found');
    }

    return {
      success: true,
      message: 'Payment fetched successfully',
      data: this.toPaymentResponse(payment),
    };
  }

  private async completeCodPayment(orderId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot pay for a cancelled order');
      }

      const payment = await tx.payment.create({
        data: {
          orderId,
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.PAID,
          amount: order.totalAmount,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status:
            order.status === OrderStatus.PENDING
              ? OrderStatus.CONFIRMED
              : order.status,
        },
      });

      return { payment, order: updatedOrder };
    });

    return {
      success: true,
      message: 'Cash on delivery payment recorded',
      data: this.toPaymentResponse(result.payment),
    };
  }

  private async createPendingBankingPayment(
    orderId: string,
    totalAmount: Prisma.Decimal,
  ) {
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        paymentMethod: PaymentMethod.BANKING,
        paymentStatus: PaymentStatus.PENDING,
        amount: totalAmount,
      },
    });

    return {
      success: true,
      message: 'Bank transfer payment is pending confirmation',
      data: this.toPaymentResponse(payment),
    };
  }

  private async createCompletedPaypalPayment(
    orderId: string,
    userId: string,
    transactionRef: string,
  ) {
    const payment = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot pay for a cancelled order');
      }

      const created = await tx.payment.create({
        data: {
          orderId,
          paymentMethod: PaymentMethod.PayPal,
          paymentStatus: PaymentStatus.PAID,
          amount: order.finalAmount,
          transactionCode: transactionRef,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status:
            order.status === OrderStatus.PENDING
              ? OrderStatus.CONFIRMED
              : order.status,
        },
      });

      return created;
    });

    return {
      success: true,
      message: 'PayPal payment completed',
      data: this.toPaymentResponse(payment),
    };
  }

  private async finalizePendingBankingPayment(
    orderId: string,
    userId: string,
    transactionRef: string,
  ) {
    const payment = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { payment: true },
      });

      if (!order?.payment) {
        throw new NotFoundException('Payment not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot pay for a cancelled order');
      }

      if (
        order.payment.paymentStatus !== PaymentStatus.PENDING ||
        order.payment.paymentMethod !== PaymentMethod.BANKING
      ) {
        throw new BadRequestException('Payment cannot be completed');
      }

      const updated = await tx.payment.update({
        where: { id: order.payment.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          transactionCode: transactionRef,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          status:
            order.status === OrderStatus.PENDING
              ? OrderStatus.CONFIRMED
              : order.status,
        },
      });

      return updated;
    });

    return {
      success: true,
      message: 'Bank transfer payment completed',
      data: this.toPaymentResponse(payment),
    };
  }

  private parseOrderPaymentMethod(raw: string): PaymentMethod | null {
    const normalized = raw.trim().toUpperCase();
    if (normalized === 'COD') {
      return PaymentMethod.COD;
    }
    if (normalized === 'BANKING') {
      return PaymentMethod.BANKING;
    }
    return null;
  }

  private assertUuid(id: string, notFoundMessage: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException(notFoundMessage);
    }
  }

  private toPaymentResponse(payment: {
    id: string;
    orderId: string;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    amount: Prisma.Decimal;
    transactionCode: string | null;
    createdAt: Date;
    paidAt: Date | null;
  }) {
    const paymentStatus = this.toWebPaymentStatus(payment.paymentStatus);
    const isPaid = paymentStatus === 'PAID';

    return {
      id: payment.id,
      order_id: payment.orderId,
      payment_method: payment.paymentMethod,
      payment_status: paymentStatus,
      transaction_code: payment.transactionCode ?? undefined,
      amount: Number(payment.amount),
      ...(isPaid && { paid_at: payment.paidAt?.toISOString() }),
      created_at: payment.createdAt.toISOString(),
    };
  }

  private toWebPaymentStatus(
    status: PaymentStatus,
  ): 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' {
    switch (status) {
      case PaymentStatus.PAID:
        return 'PAID';
      case PaymentStatus.FAILED:
        return 'FAILED';
      case PaymentStatus.PENDING:
        return 'PENDING';
      default:
        return 'PENDING';
    }
  }
}
