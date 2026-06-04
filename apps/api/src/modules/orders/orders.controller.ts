import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Patch,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  OrderDetailResponseDto,
  OrderListResponseDto,
} from './dto/order-response.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create order from current cart' })
  @ApiBody({ type: CreateOrderDto })
  @ApiOkResponse({ type: OrderDetailResponseDto })
  @Post()
  async createOrder(
    @Req() request: Request,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const user = request.user as { sub: string };
    return this.ordersService.createOrder(user.sub, createOrderDto);
  }

  @ApiOperation({ summary: 'Get current user orders' })
  @ApiOkResponse({ type: OrderListResponseDto })
  @Get('my')
  async findMyOrders(@Req() request: Request) {
    const user = request.user as { sub: string };
    return this.ordersService.findMyOrders(user.sub);
  }

  @ApiOperation({ summary: 'Get order by id (owner or admin)' })
  @ApiOkResponse({ type: OrderDetailResponseDto })
  @Get(':id')
  async findById(@Req() request: Request, @Param('id') orderId: string) {
    const user = request.user as { sub: string; role: UserRole };
    return this.ordersService.findById(orderId, user.sub, user.role);
  }

  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiOkResponse({ type: OrderDetailResponseDto })
  @Roles(UserRole.admin)
  @Put(':id/status')
  async updateStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, updateOrderStatusDto);
  }

  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiOkResponse({ type: OrderListResponseDto })
  @Roles(UserRole.admin)
  @Get()
  async findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @ApiOperation({ summary: 'Cancel order (owner only, COD + PENDING)' })
  @Patch(':id/cancel')
  async cancelOrder(@Req() request: Request, @Param('id') orderId: string) {
    const user = request.user as { sub: string };
    return this.ordersService.cancelOrder(orderId, user.sub);
  }

  @Get('reviewable')
  async getReviewableOrders(@Req() request: Request) {
    const user = request.user as { sub: string };

    return this.ordersService.getReviewableOrders(user.sub);
  }
}
