import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStrategyFactory } from './strategies/payment-strategy.factory';
import { mapPaymentToResponse } from './payment-response.mapper';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentStrategyFactory: PaymentStrategyFactory,
  ) {}

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

    if (order.payment?.paymentStatus === PaymentStatus.PAID) {
      throw new ConflictException('Đơn hàng này đã được thanh toán thành công');
    }

    const strategy = this.paymentStrategyFactory.getStrategy(
      dto.payment_method,
    );

    const result = await strategy.execute(order, dto);

    return {
      success: true,
      message: result.message,
      data: {
        ...mapPaymentToResponse(result.payment),
        ...(result.extra ?? {}),
      },
    };
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
      data: mapPaymentToResponse(payment),
    };
  }

  private assertUuid(id: string, notFoundMessage: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException(notFoundMessage);
    }
  }
}
