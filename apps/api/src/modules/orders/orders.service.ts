import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const userObjectId = this.toObjectId(userId, 'User not found');
    const session = await this.connection.startSession();

    try {
      let createdOrder: OrderDocument | null = null;

      await session.withTransaction(async () => {
        const cart = await this.cartModel
          .findOne({ user_id: userObjectId })
          .session(session)
          .exec();

        if (!cart || cart.items.length === 0) {
          throw new BadRequestException('Cart is empty');
        }

        const orderItems: Array<{
          product_id: Types.ObjectId;
          name: string;
          price: number;
          quantity: number;
        }> = [];

        let totalAmount = 0;

        for (const cartItem of cart.items) {
          const product = await this.productModel
            .findOne({
              _id: cartItem.product_id,
              is_active: true,
            })
            .session(session)
            .exec();

          if (!product) {
            throw new NotFoundException('Product not found');
          }

          if (product.stock < cartItem.quantity) {
            throw new ConflictException(`Not enough stock for product: ${product.name}`);
          }

          const updatedProduct = await this.productModel
            .findOneAndUpdate(
              {
                _id: product._id,
                stock: { $gte: cartItem.quantity },
              },
              { $inc: { stock: -cartItem.quantity } },
              { returnDocument: 'after', session },
            )
            .exec();

          if (!updatedProduct) {
            throw new ConflictException(`Not enough stock for product: ${product.name}`);
          }

          const lineTotal = product.price * cartItem.quantity;
          totalAmount += lineTotal;

          orderItems.push({
            product_id: product._id,
            name: product.name,
            price: product.price,
            quantity: cartItem.quantity,
          });
        }

        const createdOrders = await this.orderModel.create(
          [
            {
              user_id: userObjectId,
              items: orderItems,
              total_amount: totalAmount,
              status: OrderStatus.PENDING,
              receiver_name: createOrderDto.receiver_name,
              receiver_phone: createOrderDto.receiver_phone,
              shipping_address: createOrderDto.shipping_address,
              payment_method: createOrderDto.payment_method,
            },
          ],
          { session },
        );

        createdOrder = createdOrders[0];

        cart.items = [];
        await cart.save({ session });
      });

      if (!createdOrder) {
        throw new BadRequestException('Unable to create order');
      }

      return {
        success: true,
        message: 'Order created successfully',
        data: this.toOrderResponse(createdOrder),
      };
    } finally {
      await session.endSession();
    }
  }

  async findMyOrders(userId: string) {
    const userObjectId = this.toObjectId(userId, 'User not found');
    const orders = await this.orderModel
      .find({ user_id: userObjectId })
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      message: 'Orders fetched successfully',
      data: orders.map((order) => this.toOrderResponse(order)),
    };
  }

  async findById(orderId: string, requesterId: string, requesterRole: UserRole) {
    this.toObjectId(orderId, 'Order not found');
    const requesterObjectId = this.toObjectId(requesterId, 'User not found');

    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isOwner = order.user_id.toString() === requesterObjectId.toString();
    const isAdmin = requesterRole === UserRole.ADMIN;

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
    const orders = await this.orderModel.find().sort({ createdAt: -1 }).exec();
    return {
      success: true,
      message: 'All orders fetched successfully',
      data: orders.map((order) => this.toOrderResponse(order)),
    };
  }

  async updateOrderStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    this.toObjectId(orderId, 'Order not found');
    const order = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        { status: updateOrderStatusDto.status },
        { returnDocument: 'after' },
      )
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      message: 'Order status updated successfully',
      data: this.toOrderResponse(order),
    };
  }

  private toObjectId(id: string, errorMessage: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(errorMessage);
    }

    return new Types.ObjectId(id);
  }

  private toOrderResponse(order: OrderDocument) {
    return {
      id: order._id.toString(),
      user_id: order.user_id.toString(),
      items: order.items.map((item) => ({
        product_id: item.product_id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total_amount: order.total_amount,
      status: order.status,
      receiver_name: order.receiver_name,
      receiver_phone: order.receiver_phone,
      shipping_address: order.shipping_address,
      payment_method: order.payment_method,
      createdAt: order.createdAt,
    };
  }
}
