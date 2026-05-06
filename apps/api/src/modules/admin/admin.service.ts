import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: { page?: number; search?: string }) {
    const page = query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = query.search
      ? {
          OR: [
            {
              email: {
                contains: query.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              username: {
                contains: query.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          avatarUrl: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      message: 'Users fetched successfully',
      data: {
        users,
        total,
        page,
        limit,
      },
    };
  }



  async getProducts(query: {
    page?: number;
    search?: string;
    category_id?: string;
    brand_id?: string;
  }) {
    const page = query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          sku: {
            contains: query.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }
    if (query.category_id) {
      where.categoryId = query.category_id;
    }
    if (query.brand_id) {
      where.brandId = query.brand_id;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      success: true,
      message: 'Products fetched successfully',
      data: {
        products,
        total,
        page,
        limit,
      },
    };
  }

  async getCoupons(query: { page?: number; search?: string; status?: string }) {
    const page = query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        {
          code: {
            contains: query.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          couponType: {
            contains: query.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }
    if (query.status === 'active') {
      where.isActive = true;
    }
    if (query.status === 'inactive') {
      where.isActive = false;
    }

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          code: true,
          couponType: true,
          discountPercent: true,
          discountAmount: true,
          maxDiscountAmount: true,
          minOrderAmount: true,
          usageLimit: true,
          usedCount: true,
          expiryDate: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return {
      success: true,
      message: 'Coupons fetched successfully',
      data: {
        coupons,
        total,
        page,
        limit,
      },
    };
  }

  async updateUserStatus(userId: string, status: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
      },
    });

    return {
      success: true,
      message: 'User status updated successfully',
      data: user,
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        items: true,
      },
    });

    return {
      success: true,
      message: 'Order status updated successfully',
      data: order,
    };
  }

  async getStatistics(year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const monthlyRevenueRaw: Array<{
      month: number;
      revenue: string;
      orders: string;
    }> = await this.prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM "created_at")::int as month,
          SUM("final_amount") as revenue,
          COUNT(*) as orders
        FROM "orders"
        WHERE "created_at" >= ${startOfYear} AND "created_at" < ${endOfYear}
        GROUP BY EXTRACT(MONTH FROM "created_at")
        ORDER BY month
      `;

    const topProductsByQuantityRaw: Array<{
      name: string;
      total_quantity: string;
    }> = await this.prisma.$queryRaw`
        SELECT
          p."name",
          SUM(oi."quantity") as total_quantity
        FROM "order_items" oi
        JOIN "products" p ON oi."product_id" = p."id"
        JOIN "orders" o ON oi."order_id" = o."id"
        WHERE o."created_at" >= ${startOfYear} AND o."created_at" < ${endOfYear}
        GROUP BY p."id", p."name"
        ORDER BY total_quantity DESC
        LIMIT 10
      `;

    const topProductsByRevenueRaw: Array<{
      name: string;
      total_revenue: string;
    }> = await this.prisma.$queryRaw`
        SELECT
          p."name",
          SUM(oi."quantity" * oi."price") as total_revenue
        FROM "order_items" oi
        JOIN "products" p ON oi."product_id" = p."id"
        JOIN "orders" o ON oi."order_id" = o."id"
        WHERE o."created_at" >= ${startOfYear} AND o."created_at" < ${endOfYear}
        GROUP BY p."id", p."name"
        ORDER BY total_revenue DESC
        LIMIT 10
      `;

    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.product.count(),
    ]);

    return {
      success: true,
      message: 'Statistics fetched successfully',
      data: {
        year: currentYear,
        monthlyRevenue: monthlyRevenueRaw.map((item) => ({
          month: Number(item.month),
          revenue: Number(item.revenue),
          orders: Number(item.orders),
        })),
        topProductsByQuantity: topProductsByQuantityRaw.map((item) => ({
          name: item.name,
          total_quantity: Number(item.total_quantity),
        })),
        topProductsByRevenue: topProductsByRevenueRaw.map((item) => ({
          name: item.name,
          total_revenue: Number(item.total_revenue),
        })),
        totals: {
          users: totalUsers,
          orders: totalOrders,
          products: totalProducts,
        },
      },
    };
  }

  // ==================== GET ORDERS (List) ====================
  async getOrders(query: { page?: number; search?: string; status?: string }) {
    const page = query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { id: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
        {
          receiverName: {
            contains: query.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          user: {
            email: {
              contains: query.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, username: true, phone: true },
          },
          items: {
            include: {
              product: {
                select: { name: true, imageUrl: true }, // thêm nếu cần
              },
            },
          },
          coupon: true, // ← thêm
          payment: true, // ← thêm
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      message: 'Orders fetched successfully',
      data: { orders, total, page, limit },
    };
  }

  // ==================== GET ORDER BY ID (Detail) ====================
  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
        coupon: true,
        payment: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return {
      success: true,
      message: 'Order detail fetched successfully',
      data: order,
    };
  }
}
