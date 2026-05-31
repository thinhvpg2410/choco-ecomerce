import {
  BadRequestException,
  ConflictException,
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
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    this.validateUserId(userId);

    if (createOrderDto.buy_now === true) {
      return this.createBuyNowOrder(userId, createOrderDto);
    }

    return this.createCartOrder(userId, createOrderDto);
  }

  //Buy Now
  private async createBuyNowOrder(userId: string, dto: CreateOrderDto) {
    const { product_id, quantity = 1 } = dto;

    if (!product_id) {
      throw new BadRequestException('product_id is required for buy_now');
    }

    const createdOrder = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: product_id, isActive: true },
      });

      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm: ${product_id}`);
      }

      if (product.stock < quantity) {
        throw new ConflictException(
          `Không đủ hàng cho sản phẩm: ${product.name}`,
        );
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: quantity } },
      });

      const unitPrice = Number(product.salePrice ?? product.price);
      const totalAmount = unitPrice * quantity;

      const shippingFee = dto.is_hcm ? 15_000 : 30_000;
      let discountAmount = 0;

      if (dto.coupon_code) {
        discountAmount = await this.applyCouponInTx(
          tx,
          dto.coupon_code,
          totalAmount,
          shippingFee,
        );
      }

      const finalAmount = Math.max(
        0,
        totalAmount + shippingFee - discountAmount,
      );

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingFee,
          discountAmount,
          finalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          receiverName: dto.receiver_name,
          receiverPhone: dto.receiver_phone,
          shippingAddress: dto.shipping_address,
          paymentMethod: dto.payment_method,
          note: dto.note,
          paypalOrderId: dto.paypal_order_id,
          items: {
            create: [
              {
                productId: product.id,
                productNameAtTime: product.name,
                productImageAtTime: product.imageUrl,
                price: product.price,
                salePrice: product.salePrice,
                quantity,
              },
            ],
          },
        },
        include: { items: true },
      });

      return order;
    });

    return {
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      data: this.toOrderResponse(createdOrder),
    };
  }

  //Cart Order
  private async createCartOrder(userId: string, dto: CreateOrderDto) {
    const createdOrder = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Giỏ hàng trống');
      }

      const cartItemIds = dto.cart_item_ids ?? [];
      const selectedCartItems =
        cartItemIds.length > 0
          ? cart.items.filter((item) => cartItemIds.includes(item.productId))
          : cart.items;

      if (!selectedCartItems.length) {
        throw new BadRequestException(
          'Không có sản phẩm nào được chọn để đặt hàng',
        );
      }

      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
      let totalAmount = 0;

      for (const cartItem of selectedCartItems) {
        const product = await tx.product.findFirst({
          where: { id: cartItem.productId, isActive: true },
        });

        if (!product) {
          throw new NotFoundException(
            `Không tìm thấy sản phẩm: ${cartItem.productId}`,
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new ConflictException(
            `Không đủ hàng cho sản phẩm: ${product.name}`,
          );
        }

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: cartItem.quantity } },
        });

        const unitPrice = Number(product.salePrice ?? product.price);
        totalAmount += unitPrice * cartItem.quantity;

        orderItemsData.push({
          product: { connect: { id: product.id } },
          productNameAtTime: product.name,
          productImageAtTime: product.imageUrl,
          price: product.price,
          salePrice: product.salePrice,
          quantity: cartItem.quantity,
        });
      }

      const shippingFee = dto.is_hcm ? 15_000 : 30_000; 
      let discountAmount = 0;
      if (dto.coupon_code) {
        discountAmount = await this.applyCouponInTx(
          tx,
          dto.coupon_code,
          totalAmount,
          shippingFee,
        );
      }

      const shippingFee = dto.is_hcm ? 15_000 : 30_000;
      const finalAmount = Math.max(
        0,
        totalAmount + shippingFee - discountAmount,
      );

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingFee,
          discountAmount,
          finalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          receiverName: dto.receiver_name,
          receiverPhone: dto.receiver_phone,
          shippingAddress: dto.shipping_address,
          paymentMethod: dto.payment_method,
          note: dto.note,
          paypalOrderId: dto.paypal_order_id,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      // Xóa items đã mua khỏi giỏ
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          id: { in: selectedCartItems.map((item) => item.id) },
        },
      });

      return order;
    });

    return {
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      data: this.toOrderResponse(createdOrder),
    };
  }

  async findMyOrders(userId: string) {
    this.validateUserId(userId);
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return {
      success: true,
      message: 'Đơn hàng đã được lấy thành công',
      data: orders.map((order) => this.toOrderResponse(order)),
    };
  }

  async findById(
    orderId: string,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    this.validateOrderId(orderId);
    this.validateUserId(requesterId);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    const isOwner = order.userId === requesterId;
    const isAdmin = requesterRole === UserRole.admin;

    if (!isOwner && !isAdmin)
      throw new NotFoundException('Không tìm thấy đơn hàng');

    return {
      success: true,
      message: 'Đơn hàng đã được lấy thành công',
      data: this.toOrderResponse(order),
    };
  }

  async findAllOrders() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return {
      success: true,
      message: 'Tất cả đơn hàng đã được lấy thành công',
      data: orders.map((order) => this.toOrderResponse(order)),
    };
  }

  async updateOrderStatus(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    this.validateOrderId(orderId);
    const newStatus = updateOrderStatusDto.status;

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
      });

      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (order.status === OrderStatus.CANCELLED)
        throw new BadRequestException('Không thể cập nhật đơn hàng đã hủy');

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: { items: true, payment: true },
      });

      if (
        newStatus === OrderStatus.DELIVERED &&
        order.payment &&
        order.payment.paymentMethod === PaymentMethod.COD &&
        order.payment.paymentStatus === PaymentStatus.PENDING
      ) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { paymentStatus: PaymentStatus.PAID, paidAt: new Date() },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: PaymentStatus.PAID },
        });

        updatedOrder.paymentStatus = PaymentStatus.PAID;
      }

      return updatedOrder;
    });

    return {
      success: true,
      message: 'Trạng thái đơn hàng đã được cập nhật thành công',
      data: this.toOrderResponse(result),
    };
  }

  async cancelOrder(orderId: string, userId: string) {
    this.validateOrderId(orderId);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.userId !== userId)
      throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.status !== OrderStatus.PENDING)
      throw new BadRequestException(
        'Chỉ có thể huỷ đơn hàng ở trạng thái chờ xác nhận',
      );
    if (order.paymentMethod !== PaymentMethod.COD)
      throw new BadRequestException('Chỉ có thể huỷ đơn COD');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: { items: true },
    });

    return {
      success: true,
      message: 'Đơn hàng đã được huỷ thành công',
      data: this.toOrderResponse(updated),
    };
  }

  async getReviewableOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId, status: OrderStatus.DELIVERED },
      include: { items: { include: { review: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Đơn hàng có thể đánh giá đã được lấy thành công',
      data: orders,
    };
  }

  private validateUserId(id: string): void {
    if (!isUuid(id)) throw new NotFoundException('Người dùng không tồn tại');
  }

  private validateOrderId(id: string): void {
    if (!isUuid(id)) throw new NotFoundException('Đơn hàng không tồn tại');
  }

  private toOrderResponse(order: OrderWithItems) {
    return {
      id: order.id,
      user_id: order.userId,
      items:
        order.items?.map((item) => ({
          order_item_id: item.id,
          product_id: item.productId,
          name: item.productNameAtTime,
          image: item.productImageAtTime,
          price: Number(item.price),
          sale_price: item.salePrice ? Number(item.salePrice) : null,
          quantity: item.quantity,
        })) || [],
      total_amount: Number(order.totalAmount),
      shipping_fee: Number(order.shippingFee),
      final_amount: Number(order.finalAmount),
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus ?? null,
      status: order.status,
      receiver_name: order.receiverName,
      receiver_phone: order.receiverPhone,
      shipping_address: order.shippingAddress,
      note: order.note,
      createdAt: order.createdAt,
    };
  }

  private async applyCouponInTx(
    tx: Prisma.TransactionClient,
    couponCode: string,
    totalAmount: number,
    shippingFee: number,
  ): Promise<number> {
    const coupon = await tx.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Mã giảm giá không hợp lệ');
    }
    if (coupon.expiryDate && coupon.expiryDate <= new Date()) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }

    

    let discountAmount = 0;
    if (coupon.couponType === 'PERCENT') {
      const percent = Number(coupon.discountPercent ?? 0);
      discountAmount = (totalAmount * percent) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(
          discountAmount,
          Number(coupon.maxDiscountAmount),
        );
      }
    } else if (coupon.couponType === 'FIXED') {
      discountAmount = Number(coupon.discountAmount ?? 0);
    } else if (coupon.couponType === 'FREE_SHIP') {
      discountAmount = shippingFee;
    }
    if (coupon.couponType !== 'FREE_SHIP') {
      discountAmount = Math.min(discountAmount, totalAmount);
    }

    const updated = await tx.coupon.updateMany({
      where: {
        id: coupon.id,
        OR: [
          { usageLimit: null },
          { usedCount: { lt: coupon.usageLimit ?? 0 } },
        ],
      },
      data: { usedCount: { increment: 1 } },
    });

    if (updated.count === 0) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    return discountAmount;
  }
}
