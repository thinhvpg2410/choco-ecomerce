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
      throw new ConflictException('Payment already exists for this order');
    }

    if (dto.payment_method === PaymentMethod.COD) {
      return this.createPendingCodPayment(order.id);
    }

    if (dto.payment_method === PaymentMethod.PayPal) {
      if (!dto.transaction_code) {
        throw new BadRequestException(
          'transaction_code is required for PayPal payment',
        );
      }

      return this.createCompletedPaypalPayment(
        order.id,
        userId,
        dto.transaction_code,
      );
    }

    throw new BadRequestException('Unsupported payment method');
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

  private async createPendingCodPayment(orderId: string) {
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
          paymentStatus: PaymentStatus.PENDING,
          amount: order.finalAmount,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      return { payment };
    });

    return {
      success: true,
      message: 'Cash on delivery payment is pending until delivery',
      data: this.toPaymentResponse(result.payment),
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

  private toWebPaymentStatus(status: PaymentStatus): 'PENDING' | 'PAID' {
    switch (status) {
      case PaymentStatus.PAID:
        return 'PAID';
      case PaymentStatus.PENDING:
      default:
        return 'PENDING';
    }
  }
}
