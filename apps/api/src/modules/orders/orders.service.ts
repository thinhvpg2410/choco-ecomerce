import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    this.validateUserId(userId);

    const createdOrder = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const cartItemIds = createOrderDto.cart_item_ids ?? [];

      const selectedCartItems =
        cartItemIds.length > 0
          ? cart.items.filter((item) => cartItemIds.includes(item.productId))
          : cart.items;

      if (!selectedCartItems.length) {
        throw new BadRequestException('No cart items selected for order');
      }

      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
      let totalAmount = 0;

      for (const cartItem of selectedCartItems) {
        const product = await tx.product.findFirst({
          where: { id: cartItem.productId, isActive: true },
        });

        if (!product) {
          throw new NotFoundException(
            `Product not found: ${cartItem.productId}`,
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new ConflictException(
            `Not enough stock for product: ${product.name}`,
          );
        }

        // Cập nhật stock
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

      // Tạo Order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingFee: 30000,
          finalAmount: totalAmount + 30000,
          status: OrderStatus.PENDING,
          receiverName: createOrderDto.receiver_name,
          receiverPhone: createOrderDto.receiver_phone,
          shippingAddress: createOrderDto.shipping_address,
          paymentMethod: createOrderDto.payment_method,
          note: createOrderDto.note,
          paypalOrderId: createOrderDto.paypal_order_id, // ← Quan trọng nhất
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      // Xóa items đã mua trong giỏ hàng
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
      message: 'Order created successfully',
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
      message: 'Orders fetched successfully',
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

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isOwner = order.userId === requesterId;
    const isAdmin = requesterRole === UserRole.admin;

    if (!isOwner && !isAdmin) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      message: 'Order fetched successfully',
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
      message: 'All orders fetched successfully',
      data: orders.map((order) => this.toOrderResponse(order)),
    };
  }

  async updateOrderStatus(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    this.validateOrderId(orderId);
    try {
      const order = await this.prisma.order.update({
        where: { id: orderId },
        data: { status: updateOrderStatusDto.status },
        include: { items: true },
      });
      return {
        success: true,
        message: 'Order status updated successfully',
        data: this.toOrderResponse(order),
      };
    } catch {
      throw new NotFoundException('Order not found');
    }
  }

  private validateUserId(id: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException('User not found');
    }
  }

  private validateOrderId(id: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException('Order not found');
    }
  }

  private toOrderResponse(order: OrderWithItems) {
    return {
      id: order.id,
      user_id: order.userId,

      items:
        order.items?.map((item) => ({
          product_id: item.productId,
          name: item.productNameAtTime,
          image: item.productImageAtTime,
          price: Number(item.price),
          sale_price: item.salePrice ? Number(item.salePrice) : null,
          quantity: item.quantity,
        })) || [],

      total_amount: Number(order.totalAmount),

      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      status: order.status,

      receiver_name: order.receiverName,
      receiver_phone: order.receiverPhone,
      shipping_address: order.shippingAddress,
      note: order.note,
      createdAt: order.createdAt,
    };
  }
}
