import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';

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
      message: 'Lấy danh sách người dùng thành công',
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
          name: { contains: query.search, mode: Prisma.QueryMode.insensitive },
        },
        { sku: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
      ];
    }
    if (query.category_id) where.categoryId = query.category_id;
    if (query.brand_id) where.brandId = query.brand_id;

    const [products, total, activeCount, hiddenCount, outOfStockCount] =
      await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            category: {
              select: { id: true, name: true, slug: true, isActive: true },
            },
            brand: {
              select: { id: true, name: true, slug: true, isActive: true },
            },
          },
        }),
        this.prisma.product.count({ where }),
        this.prisma.product.count({ where: { isActive: true } }), // ← toàn hệ thống
        this.prisma.product.count({ where: { isActive: false } }),
        this.prisma.product.count({ where: { stock: 0 } }),
      ]);

    return {
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: {
        products: products.map((p) => this.toAdminProductResponse(p)),
        total,
        activeCount,
        hiddenCount,
        outOfStockCount,
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
      message: 'Lấy danh sách mã giảm giá thành công',
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
      message: 'Cập nhật trạng thái người dùng thành công',
      data: user,
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['SHIPPING', 'CANCELLED'],
      SHIPPING: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (status === order.status) {
      return {
        success: true,
        message: 'Trạng thái đơn hàng không thay đổi',
        data: order,
      };
    }

    if (!allowedTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(
        `Invalid order status transition from ${order.status} to ${status}`,
      );
    }

    const updateData: any = {
      status: status as any,
    };

    const shouldMarkPaidForCod =
      order.paymentMethod === 'COD' &&
      order.status === OrderStatus.SHIPPING &&
      status === OrderStatus.DELIVERED;

    if (shouldMarkPaidForCod) {
      updateData.paymentStatus = PaymentStatus.PAID;
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      if (shouldMarkPaidForCod && order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(),
          },
        });
      }

      if (shouldMarkPaidForCod && !order.payment) {
        await tx.payment.create({
          data: {
            orderId,
            paymentMethod: 'COD',
            paymentStatus: PaymentStatus.PAID,
            amount: order.finalAmount,
            paidAt: new Date(),
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          items: true,
          payment: true,
        },
      });
    });

    return {
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: updatedOrder,
    };
  }

  async getStatistics(year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    try {
      const validStatuses = await this.prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"OrderStatus")) as status;
    `;
      console.log('Valid OrderStatus:', validStatuses);

      //DOANH THU THEO THÁNG
      const monthlyRevenueRaw = await this.prisma.$queryRaw<any[]>`
      SELECT
        EXTRACT(MONTH FROM o."created_at")::int as month,
        COALESCE(SUM(o."final_amount"), 0) as revenue,
        COUNT(*)::int as orders
      FROM "orders" o
      WHERE o."created_at" >= ${startOfYear}
        AND o."created_at" < ${endOfYear}
        AND o."status" IN ('DELIVERED', 'SHIPPING') 
      GROUP BY EXTRACT(MONTH FROM o."created_at")
      ORDER BY month
    `;

      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const found = monthlyRevenueRaw.find((m) => m.month === i + 1);
        return {
          month: i + 1,
          revenue: found ? Number(found.revenue) : 0,
          orders: found ? Number(found.orders) : 0,
        };
      });

      //TOP SẢN PHẨM & DANH MỤC
      const [
        topProductsByQuantityRaw,
        topProductsByRevenueRaw,
        categoryRevenueRaw,
      ] = await Promise.all([
        this.prisma.$queryRaw<any[]>`
        SELECT 
          p."name", 
          p."image_url", 
          SUM(oi."quantity")::int as total_quantity
        FROM "order_items" oi
        JOIN "products" p ON p."id" = oi."product_id"
        JOIN "orders" o ON o."id" = oi."order_id"
        WHERE o."created_at" >= ${startOfYear}
          AND o."created_at" < ${endOfYear}
          AND o."status" IN ('DELIVERED', 'SHIPPING')
        GROUP BY p."id", p."name", p."image_url"
        ORDER BY total_quantity DESC
        LIMIT 10
      `,

        this.prisma.$queryRaw<any[]>`
        SELECT 
          p."name", 
          p."image_url", 
          SUM(oi."quantity" * oi."price") as total_revenue
        FROM "order_items" oi
        JOIN "products" p ON p."id" = oi."product_id"
        JOIN "orders" o ON o."id" = oi."order_id"
        WHERE o."created_at" >= ${startOfYear}
          AND o."created_at" < ${endOfYear}
          AND o."status" IN ('DELIVERED', 'SHIPPING')
        GROUP BY p."id", p."name", p."image_url"
        ORDER BY total_revenue DESC
        LIMIT 10
      `,

        this.prisma.$queryRaw<any[]>`
        SELECT 
          c."name" as category_name, 
          SUM(oi."quantity" * oi."price") as revenue
        FROM "order_items" oi
        JOIN "products" p ON p."id" = oi."product_id"
        JOIN "categories" c ON c."id" = p."category_id"
        JOIN "orders" o ON o."id" = oi."order_id"
        WHERE o."created_at" >= ${startOfYear}
          AND o."created_at" < ${endOfYear}
          AND o."status" IN ('DELIVERED', 'SHIPPING')
        GROUP BY c."id", c."name"
        ORDER BY revenue DESC
      `,
      ]);

      const [totalUsers, totalOrders, totalProducts] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.order.count(),
        this.prisma.product.count(),
      ]);

      return {
        success: true,
        message: 'Thống kê thành công',
        data: {
          year: currentYear,
          monthlyRevenue,
          topProductsByQuantity: topProductsByQuantityRaw.map((i) => ({
            name: i.name || '',
            image_url: i.image_url || '',
            total_quantity: Number(i.total_quantity || 0),
          })),
          topProductsByRevenue: topProductsByRevenueRaw.map((i) => ({
            name: i.name || '',
            image_url: i.image_url || '',
            total_revenue: Number(i.total_revenue || 0),
          })),
          categoryRevenue: categoryRevenueRaw.map((i) => ({
            name: i.category_name || '',
            revenue: Number(i.revenue || 0),
          })),
          totals: {
            users: totalUsers,
            orders: totalOrders,
            products: totalProducts,
          },
        },
      };
    } catch (error: any) {
      console.error('Lỗi thống kê:', error.message);
      throw error;
    }
  }

  //GET ORDERS (List)
  async getOrders(query: { page?: number; search?: string; status?: string }) {
    const page = query.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    const allowedOrderStatuses = [
      'PENDING',
      'SHIPPING',
      'DELIVERED',
      'CANCELLED',
    ];

    if (query.status && allowedOrderStatuses.includes(query.status)) {
      where.status = query.status;
    }

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
                select: { name: true, imageUrl: true },
              },
            },
          },
          coupon: true,
          payment: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
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
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order,
    };
  }

  async updateOrderPaymentStatus(orderId: string, paymentStatus: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            paymentStatus: paymentStatus as any,
            paidAt: paymentStatus === 'PAID' ? new Date() : null,
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: paymentStatus as any,
        },
      });
    });

    return {
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: updated,
    };
  }

  private toAdminProductResponse(p: any) {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      price: Number(p.price),
      sale_price: p.salePrice ? Number(p.salePrice) : null,
      cost_price: p.costPrice ? Number(p.costPrice) : null,
      stock: p.stock,
      image_url: p.imageUrl,
      category_id: p.categoryId,
      brand_id: p.brandId,
      is_active: p.isActive,
      is_featured: p.isFeatured,
      is_best_seller: p.isBestSeller,
      is_new: p.isNew,
      average_rating: p.averageRating ? Number(p.averageRating) : null,
      review_count: p.reviewCount,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      category: p.category,
      brand: p.brand,
      _count: p._count,
    };
  }
}
