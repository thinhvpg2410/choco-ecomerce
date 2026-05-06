import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cart, CartItem, Product } from '@prisma/client';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { GuestCartItemDto } from './dto/guest-cart-item.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';

type CartWithItems = Cart & { items: CartItem[] };

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    this.validateUserId(userId);
    const cart = await this.findOrCreateCartWithItems(userId);

    return {
      success: true,
      message: 'Cart fetched successfully',
      data: this.toCartResponse(cart),
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    this.validateUserId(userId);
    const product = await this.ensureProductExists(addToCartDto.product_id);
    const cart = await this.findOrCreateCart(userId);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + addToCartDto.quantity,
          price: product.price,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: addToCartDto.quantity,
          price: product.price,
        },
      });
    }

    const updatedCart = await this.loadCartWithItems(cart.id);

    return {
      success: true,
      message: 'Product added to cart successfully',
      data: this.toCartResponse(updatedCart),
    };
  }

  async updateCartItem(userId: string, updateCartItemDto: UpdateCartItemDto) {
    this.validateUserId(userId);
    await this.ensureProductExists(updateCartItemDto.product_id);

    const cart = await this.findOrCreateCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: updateCartItemDto.product_id,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: updateCartItemDto.quantity },
    });

    const updatedCart = await this.loadCartWithItems(cart.id);

    return {
      success: true,
      message: 'Cart item updated successfully',
      data: this.toCartResponse(updatedCart),
    };
  }

  async removeCartItem(userId: string, productId: string) {
    this.validateProductId(productId);
    this.validateUserId(userId);
    const cart = await this.findOrCreateCart(userId);

    const result = await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Cart item not found');
    }

    const updatedCart = await this.loadCartWithItems(cart.id);

    return {
      success: true,
      message: 'Cart item removed successfully',
      data: this.toCartResponse(updatedCart),
    };
  }

  async clearCart(userId: string) {
    this.validateUserId(userId);
    const cart = await this.findOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const updatedCart = await this.loadCartWithItems(cart.id);

    return {
      success: true,
      message: 'Cart cleared successfully',
      data: this.toCartResponse(updatedCart),
    };
  }

 
  async mergeGuestCart(userId: string, guestCart: GuestCartItemDto[]) {
    this.validateUserId(userId);
    if (!guestCart.length) {
      const cart = await this.findOrCreateCartWithItems(userId);
      return {
        success: true,
        message: 'No guest items to merge',
        data: this.toCartResponse(cart),
      };
    }

    const mergedLines = this.normalizeGuestCartQuantities(guestCart);

    const cartWithItems = await this.prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({ where: { userId } });
      if (!cart) {
        cart = await tx.cart.create({ data: { userId } });
      }

      const existingItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
      });
      const existingByProductId = new Map(
        existingItems.map((item) => [item.productId, item]),
      );

      for (const [productId, guestQuantity] of mergedLines) {
        const product = await tx.product.findFirst({
          where: { id: productId, isActive: true },
        });

        if (!product) {
          throw new NotFoundException(`Product not found: ${productId}`);
        }

        const existing = existingByProductId.get(productId);
        const currentQty = existing?.quantity ?? 0;
        const nextQty = currentQty + guestQuantity;

        if (nextQty > product.stock) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}" (${productId}). In stock: ${product.stock}, cart would be: ${nextQty}`,
          );
        }

        if (existing) {
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: nextQty, price: product.price },
          });
        } else {
          const created = await tx.cartItem.create({
            data: {
              cartId: cart.id,
              productId: product.id,
              quantity: guestQuantity,
              price: product.price,
            },
          });
          existingByProductId.set(productId, created);
        }
      }

      return tx.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: { items: true },
      });
    });

    return {
      success: true,
      message: 'Guest cart merged successfully',
      data: this.toCartResponse(cartWithItems),
    };
  }

  private normalizeGuestCartQuantities(
    guestCart: GuestCartItemDto[],
  ): Map<string, number> {
    const merged = new Map<string, number>();
    for (const line of guestCart) {
      const prev = merged.get(line.product_id) ?? 0;
      merged.set(line.product_id, prev + line.quantity);
    }
    return merged;
  }

  private async findOrCreateCart(userId: string): Promise<Cart> {
    const existing = await this.prisma.cart.findUnique({
      where: { userId },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.cart.create({
      data: { userId },
    });
  }

  private async findOrCreateCartWithItems(userId: string): Promise<CartWithItems> {
    const cart = await this.findOrCreateCart(userId);
    return this.loadCartWithItems(cart.id);
  }

  private async loadCartWithItems(cartId: string): Promise<CartWithItems> {
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: { items: true },
    });
    return cart;
  }

  private async ensureProductExists(productId: string): Promise<Product> {
    this.validateProductId(productId);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private validateUserId(id: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException('User not found');
    }
  }

  private validateProductId(id: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException('Product not found');
    }
  }

  private toCartResponse(cart: CartWithItems) {
    const items = cart.items.map((item) => {
      const price = Number(item.price);
      return {
        product_id: item.productId,
        quantity: item.quantity,
        price,
        subtotal: item.quantity * price,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      user_id: cart.userId,
      items,
      total_amount: totalAmount,
      updatedAt: cart.updatedAt,
    };
  }
}
