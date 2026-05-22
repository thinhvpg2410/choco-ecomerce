import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { isUuid } from '../../common/utils/is-uuid';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    this.assertUuid(userId, 'Người dùng không tồn tại');
    this.assertUuid(dto.product_id, 'Sản phẩm không tồn tại');

    const product = await this.prisma.product.findFirst({
      where: { id: dto.product_id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        id: dto.order_item_id,
        productId: dto.product_id,
        order: {
          userId,
          status: OrderStatus.DELIVERED,
        },
      },
      include: {
        review: true,
      },
    });

    if (!orderItem) {
      throw new ForbiddenException('Bạn chỉ có thể đánh giá sản phẩm đã nhận');
    }

    if (orderItem.review) {
      throw new ConflictException('Bạn đã đánh giá sản phẩm này rồi');
    }

    try {
      const review = await this.prisma.$transaction(async (tx) => {
        const created = await tx.review.create({
          data: {
            userId,
            productId: dto.product_id,
            orderItemId: dto.order_item_id,
            rating: dto.rating,
            comment: dto.comment ?? null,
          },
        });

        await this.syncProductRating(tx, dto.product_id);
        return created;
      });

      await this.cache.invalidateAfterProductWrite(dto.product_id);
      return {
        success: true,
        message: 'Đánh giá sản phẩm thành công',
        data: this.toReviewResponse(review),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Bạn đã đánh giá sản phẩm này rồi');
      }
      throw error;
    }
  }

  async findByProduct(productId: string, query: QueryReviewsDto) {
    this.assertUuid(productId, 'Không tìm thấy sản phẩm');

    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          productId,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,

        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);

    return {
      success: true,
      message: 'Đánh giá sản phẩm đã được lấy thành công',
      data: {
        items: reviews.map((r) => this.toReviewResponse(r)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async update(
    reviewId: string,
    userId: string,
    role: UserRole,
    dto: UpdateReviewDto,
  ) {
    this.assertUuid(reviewId, 'Đánh giá không tồn tại');
    this.assertUuid(userId, 'Người dùng không tồn tại');

    if (dto.rating === undefined && dto.comment === undefined) {
      throw new BadRequestException('Đánh giá không có gì thay đổi');
    }

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    const isOwner = review.userId === userId;
    const isAdmin = role === UserRole.admin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Bạn không thể chỉnh sửa đánh giá này');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.review.update({
        where: { id: reviewId },
        data: {
          ...(dto.rating !== undefined && { rating: dto.rating }),
          ...(dto.comment !== undefined && { comment: dto.comment }),
        },
      });

      await this.syncProductRating(tx, review.productId);
      return next;
    });

    await this.cache.invalidateAfterProductWrite(review.productId);
    return {
      success: true,
      message: 'Đánh giá đã được cập nhật thành công',
      data: this.toReviewResponse(updated),
    };
  }

  async remove(reviewId: string, userId: string, role: UserRole) {
    this.assertUuid(reviewId, 'Đánh giá không tồn tại');
    this.assertUuid(userId, 'Người dùng không tồn tại');

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    const isOwner = review.userId === userId;
    const isAdmin = role === UserRole.admin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Bạn không thể xóa đánh giá này');
    }

    const productId = review.productId;
    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await this.syncProductRating(tx, productId);
    });

    await this.cache.invalidateAfterProductWrite(productId);
    return {
      success: true,
      message: 'Đánh giá đã được xóa thành công',
    };
  }

  private async hasDeliveredPurchase(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        //status: OrderStatus.DELIVERED,
        items: { some: { productId } },
      },
      select: { id: true },
    });

    return !!order;
  }

  private async syncProductRating(
    tx: Prisma.TransactionClient,
    productId: string,
  ): Promise<void> {
    const agg = await tx.review.aggregate({
      where: {
        productId,
        isActive: true,
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const count = agg._count._all;
    const average =
      count === 0 || agg._avg.rating === null
        ? null
        : Number(agg._avg.rating.toFixed(2));

    await tx.product.update({
      where: { id: productId },
      data: {
        averageRating: average,
        reviewCount: count,
      },
    });
  }

  private assertUuid(id: string, notFoundMessage: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException(notFoundMessage);
    }
  }

  private toReviewResponse(review: any) {
    return {
      id: review.id,
      user_id: review.userId,
      product_id: review.productId,
      order_item_id: review.orderItemId,
      rating: review.rating,
      comment: review.comment ?? undefined,
      created_at: review.createdAt.toISOString(),

      user: review.user
        ? {
            id: review.user.id,
            full_name: review.user.username,
            avatar_url: review.user.avatarUrl,
          }
        : null,
    };
  }

  async getMyReviewForProduct(userId: string, productId: string) {
    this.assertUuid(userId, 'Người dùng không tồn tại');
    this.assertUuid(productId, 'Sản phẩm không tồn tại');

    const review = await this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    return {
      success: true,
      message: 'Đánh giá đã được lấy thành công',
      data: review ? this.toReviewResponse(review) : null,
    };
  }
}
