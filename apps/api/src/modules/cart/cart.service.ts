import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string) {
    const userObjectId = this.toObjectId(userId, 'User not found');
    const cart = await this.findOrCreateCart(userObjectId);

    return {
      success: true,
      message: 'Cart fetched successfully',
      data: this.toCartResponse(cart),
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const userObjectId = this.toObjectId(userId, 'User not found');
    const product = await this.ensureProductExists(addToCartDto.product_id);
    const cart = await this.findOrCreateCart(userObjectId);

    const existingItem = cart.items.find(
      (item) => item.product_id.toString() === addToCartDto.product_id,
    );

    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        product_id: product._id,
        quantity: addToCartDto.quantity,
        price: product.price,
      });
    }

    await cart.save();

    return {
      success: true,
      message: 'Product added to cart successfully',
      data: this.toCartResponse(cart),
    };
  }

  async updateCartItem(userId: string, updateCartItemDto: UpdateCartItemDto) {
    const userObjectId = this.toObjectId(userId, 'User not found');
    await this.ensureProductExists(updateCartItemDto.product_id);

    const cart = await this.findOrCreateCart(userObjectId);
    const item = cart.items.find(
      (cartItem) => cartItem.product_id.toString() === updateCartItemDto.product_id,
    );

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = updateCartItemDto.quantity;
    await cart.save();

    return {
      success: true,
      message: 'Cart item updated successfully',
      data: this.toCartResponse(cart),
    };
  }

  async removeCartItem(userId: string, productId: string) {
    this.toObjectId(productId, 'Product not found');
    const userObjectId = this.toObjectId(userId, 'User not found');
    const cart = await this.findOrCreateCart(userObjectId);

    const initialCount = cart.items.length;
    cart.items = cart.items.filter((item) => item.product_id.toString() !== productId);

    if (initialCount === cart.items.length) {
      throw new NotFoundException('Cart item not found');
    }

    await cart.save();

    return {
      success: true,
      message: 'Cart item removed successfully',
      data: this.toCartResponse(cart),
    };
  }

  async clearCart(userId: string) {
    const userObjectId = this.toObjectId(userId, 'User not found');
    const cart = await this.findOrCreateCart(userObjectId);
    cart.items = [];
    await cart.save();

    return {
      success: true,
      message: 'Cart cleared successfully',
      data: this.toCartResponse(cart),
    };
  }

  private async findOrCreateCart(userId: Types.ObjectId): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ user_id: userId }).exec();
    if (cart) {
      return cart;
    }

    return this.cartModel.create({ user_id: userId, items: [] });
  }

  private async ensureProductExists(productId: string): Promise<ProductDocument> {
    const productObjectId = this.toObjectId(productId, 'Product not found');
    const product = await this.productModel
      .findOne({ _id: productObjectId, is_active: true })
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private toObjectId(id: string, errorMessage: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(errorMessage);
    }

    return new Types.ObjectId(id);
  }

  private toCartResponse(cart: CartDocument) {
    const items = cart.items.map((item) => ({
      product_id: item.product_id.toString(),
      quantity: item.quantity,
      price: item.price,
      subtotal: item.quantity * item.price,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      user_id: cart.user_id.toString(),
      items,
      total_amount: totalAmount,
      updatedAt: cart.updatedAt,
    };
  }
}
