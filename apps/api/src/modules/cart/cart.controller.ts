import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartDetailResponseDto } from './dto/cart-response.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get current user cart' })
  @ApiOkResponse({ type: CartDetailResponseDto })
  @Get()
  async getCart(@Req() request: Request) {
    const user = request.user as { sub: string };
    return this.cartService.getCart(user.sub);
  }

  @ApiOperation({ summary: 'Add product to cart' })
  @ApiBody({ type: AddToCartDto })
  @ApiOkResponse({ type: CartDetailResponseDto })
  @Post('add')
  async addToCart(@Req() request: Request, @Body() addToCartDto: AddToCartDto) {
    const user = request.user as { sub: string };
    return this.cartService.addToCart(user.sub, addToCartDto);
  }

  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiOkResponse({ type: CartDetailResponseDto })
  @Put('update')
  async updateCartItem(
    @Req() request: Request,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const user = request.user as { sub: string };
    return this.cartService.updateCartItem(user.sub, updateCartItemDto);
  }

  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiOkResponse({ type: CartDetailResponseDto })
  @Delete('remove/:productId')
  async removeCartItem(@Req() request: Request, @Param('productId') productId: string) {
    const user = request.user as { sub: string };
    return this.cartService.removeCartItem(user.sub, productId);
  }

  @ApiOperation({ summary: 'Clear current user cart' })
  @ApiOkResponse({ type: CartDetailResponseDto })
  @Delete('clear')
  async clearCart(@Req() request: Request) {
    const user = request.user as { sub: string };
    return this.cartService.clearCart(user.sub);
  }
}
