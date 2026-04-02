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
    this.assertUuid(userId, 'User not found');
    this.assertUuid(dto.product_id, 'Product not found');

    const product = await this.prisma.product.findFirst({
      where: { id: dto.product_id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const canReview = await this.hasDeliveredPurchase(userId, dto.product_id);
    if (!canReview) {
      throw new ForbiddenException(
        'Only customers who received this product can leave a review',
      );
    }

    try {
      const review = await this.prisma.$transaction(async (tx) => {
        const created = await tx.review.create({
          data: {
            userId,
            productId: dto.product_id,
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
        message: 'Review created successfully',
        data: this.toReviewResponse(review),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You have already reviewed this product');
      }
      throw error;
    }
  }

  async findByProduct(productId: string, query: QueryReviewsDto) {
    this.assertUuid(productId, 'Product not found');

    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);

    return {
      success: true,
      message: 'Reviews fetched successfully',
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

  async update(reviewId: string, userId: string, role: UserRole, dto: UpdateReviewDto) {
    this.assertUuid(reviewId, 'Review not found');
    this.assertUuid(userId, 'User not found');

    if (dto.rating === undefined && dto.comment === undefined) {
      throw new BadRequestException('No changes provided');
    }

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const isOwner = review.userId === userId;
    const isAdmin = role === UserRole.admin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You cannot edit this review');
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
      message: 'Review updated successfully',
      data: this.toReviewResponse(updated),
    };
  }

  async remove(reviewId: string, userId: string, role: UserRole) {
    this.assertUuid(reviewId, 'Review not found');
    this.assertUuid(userId, 'User not found');

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const isOwner = review.userId === userId;
    const isAdmin = role === UserRole.admin;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You cannot delete this review');
    }

    const productId = review.productId;
    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await this.syncProductRating(tx, productId);
    });

    await this.cache.invalidateAfterProductWrite(productId);
    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  private async hasDeliveredPurchase(userId: string, productId: string): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.DELIVERED,
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
      where: { productId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const count = agg._count._all;
    const average =
      count === 0 || agg._avg.rating === null ? null : Number(agg._avg.rating.toFixed(2));

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

  private toReviewResponse(review: {
    id: string;
    userId: string;
    productId: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }) {
    const row: {
      id: string;
      user_id: string;
      product_id: string;
      rating: number;
      created_at: string;
      comment?: string;
    } = {
      id: review.id,
      user_id: review.userId,
      product_id: review.productId,
      rating: review.rating,
      created_at: review.createdAt.toISOString(),
    };

    if (review.comment !== null && review.comment !== '') {
      row.comment = review.comment;
    }

    return row;
  }
}
