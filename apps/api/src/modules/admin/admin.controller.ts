import { Body, Controller, Get, Patch, Query, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateOrderStatusAdminDto } from './dto/update-order-status-admin.dto';
import { UpdateOrderPaymentStatusDto } from './dto/update-order-payment-status.dto';
@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get users for admin panel' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Roles(UserRole.admin)
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers({
      page: page ? Number(page) : undefined,
      search,
    });
  }

  @ApiOperation({ summary: 'Update user status (active/inactive)' })
  @Roles(UserRole.admin)
  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(userId, body.status);
  }

  @ApiOperation({ summary: 'Get orders for admin panel' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @Roles(UserRole.admin)
  @Get('orders')
  async getOrders(
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getOrders({
      page: page ? Number(page) : undefined,
      search,
      status,
    });
  }

  @ApiOperation({ summary: 'Update order status' })
  @Roles(UserRole.admin)
  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() body: UpdateOrderStatusAdminDto,
  ) {
    return this.adminService.updateOrderStatus(orderId, body.status);
  }

  @ApiOperation({ summary: 'Get products for admin panel' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiQuery({ name: 'brand_id', required: false })
  @Roles(UserRole.admin)
  @Get('products')
  async getProducts(
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('category_id') categoryId?: string,
    @Query('brand_id') brandId?: string,
  ) {
    return this.adminService.getProducts({
      page: page ? Number(page) : undefined,
      search,
      category_id: categoryId,
      brand_id: brandId,
    });
  }

  @ApiOperation({ summary: 'Get coupons for admin panel' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @Roles(UserRole.admin)
  @Get('coupons')
  async getCoupons(
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getCoupons({
      page: page ? Number(page) : undefined,
      search,
      status,
    });
  }

  @ApiOperation({ summary: 'Get admin statistics by year' })
  @ApiQuery({ name: 'year', required: false })
  @Roles(UserRole.admin)
  @Get('statistics')
  async getStatistics(@Query('year') year?: string) {
    return this.adminService.getStatistics(year ? Number(year) : undefined);
  }

  @ApiOperation({ summary: 'Update payment status' })
  @Roles(UserRole.admin)
  @Patch('orders/:id/payment-status')
  async updateOrderPaymentStatus(
    @Param('id') orderId: string,
    @Body() body: UpdateOrderPaymentStatusDto,
  ) {
    return this.adminService.updateOrderPaymentStatus(
      orderId,
      body.paymentStatus,
    );
  }
}
