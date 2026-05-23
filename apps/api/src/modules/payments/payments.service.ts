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
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không thể thanh toán cho đơn hàng này');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Không thể thanh toán cho đơn hàng đã hủy');
    }

    if (order.payment) {
      throw new ConflictException('Đơn hàng này đã được thanh toán');
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

    throw new BadRequestException('Phương thức thanh toán không được hỗ trợ');
  }

  async findByOrderId(
    orderId: string,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    this.assertUuid(orderId, 'Đơn hàng không tồn tại');
    this.assertUuid(requesterId, 'Người dùng không tồn tại');

    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    const isOwner = payment.order.userId === requesterId;
    const isAdmin = requesterRole === UserRole.admin;

    if (!isOwner && !isAdmin) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    return {
      success: true,
      message: 'Lấy thông tin thanh toán thành công',
      data: this.toPaymentResponse(payment),
    };
  }

  private async createPendingCodPayment(orderId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }
      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Không thể thanh toán cho đơn hàng đã hủy');
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
      message: 'Vui lòng thanh toán khi nhận hàng',
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
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Không thể thanh toán cho đơn hàng đã hủy');
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
      message: 'Thanh toán PayPal đã hoàn tất',
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
