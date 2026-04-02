import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CouponType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';
import { AuthService } from '../auth/auth.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async findPublicList() {
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Coupons fetched successfully',
      data: coupons.map((c) => this.toCouponResponse(c)),
    };
  }

  async create(dto: CreateCouponDto) {
    this.validateCouponValue(dto.type, dto.value, dto.max_discount);
    const code = this.normalizeCode(dto.code);

    try {
      const coupon = await this.prisma.coupon.create({
        data: {
          code,
          type: dto.type,
          value: dto.value,
          maxDiscount: dto.max_discount ?? null,
          minOrderAmount: dto.min_order_amount ?? 0,
          usageLimit: dto.usage_limit ?? null,
          expiresAt: dto.expires_at ? new Date(dto.expires_at) : null,
          isActive: dto.is_active ?? true,
        },
      });

      return {
        success: true,
        message: 'Coupon created successfully',
        data: this.toCouponResponse(coupon),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Coupon code already exists');
      }
      throw error;
    }
  }

  async update(couponId: string, dto: UpdateCouponDto) {
    this.assertUuid(couponId, 'Coupon not found');

    const existing = await this.prisma.coupon.findUnique({ where: { id: couponId } });
    if (!existing) {
      throw new NotFoundException('Coupon not found');
    }

    const nextType = dto.type ?? existing.type;
    const nextValue = dto.value ?? Number(existing.value);
    const nextMaxRaw = dto.max_discount !== undefined ? dto.max_discount : existing.maxDiscount;
    const nextMax =
      nextMaxRaw === null || nextMaxRaw === undefined ? undefined : Number(nextMaxRaw);

    this.validateCouponValue(nextType, nextValue, nextMax);

    try {
      const coupon = await this.prisma.coupon.update({
        where: { id: couponId },
        data: {
          ...(dto.code !== undefined && { code: this.normalizeCode(dto.code) }),
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.value !== undefined && { value: dto.value }),
          ...(dto.max_discount !== undefined && { maxDiscount: dto.max_discount }),
          ...(dto.min_order_amount !== undefined && { minOrderAmount: dto.min_order_amount }),
          ...(dto.usage_limit !== undefined && { usageLimit: dto.usage_limit }),
          ...(dto.expires_at !== undefined && {
            expiresAt: dto.expires_at ? new Date(dto.expires_at) : null,
          }),
          ...(dto.is_active !== undefined && { isActive: dto.is_active }),
        },
      });

      return {
        success: true,
        message: 'Coupon updated successfully',
        data: this.toCouponResponse(coupon),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Coupon code already exists');
      }
      throw error;
    }
  }

  async remove(couponId: string) {
    this.assertUuid(couponId, 'Coupon not found');

    try {
      await this.prisma.coupon.delete({ where: { id: couponId } });
      return {
        success: true,
        message: 'Coupon deleted successfully',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Coupon not found');
      }
      throw error;
    }
  }

  async apply(authorization: string | undefined, dto: ApplyCouponDto) {
    const hasOrder = !!dto.order_id;
    const hasSubtotal = dto.subtotal !== undefined && dto.subtotal !== null;

    if (hasOrder === hasSubtotal) {
      throw new BadRequestException('Provide exactly one of order_id or subtotal');
    }

    let userId: string | undefined;
    if (hasOrder) {
      const token = this.extractBearer(authorization);
      if (!token) {
        throw new UnauthorizedException('Authorization required when using order_id');
      }
      userId = this.authService.verifyAccessToken(token).sub;
    }

    const code = this.normalizeCode(dto.code);
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or inactive coupon');
    }

    const now = new Date();
    if (coupon.expiresAt && coupon.expiresAt <= now) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    let subtotal: number;
    if (hasOrder && dto.order_id && userId) {
      const order = await this.prisma.order.findFirst({
        where: { id: dto.order_id, userId },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      subtotal = Number(order.totalAmount);
    } else {
      subtotal = Number(dto.subtotal);
    }

    const minOrder = Number(coupon.minOrderAmount);
    if (subtotal < minOrder) {
      throw new BadRequestException(
        `Minimum order amount of ${minOrder} required for this coupon`,
      );
    }

    const discount = this.computeDiscount(coupon, subtotal);
    const finalAmount = this.roundMoney(Math.max(0, subtotal - discount));

    return {
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discount_amount: discount,
        subtotal,
        final_amount: finalAmount,
      },
    };
  }

  private computeDiscount(
    coupon: {
      type: CouponType;
      value: Prisma.Decimal;
      maxDiscount: Prisma.Decimal | null;
    },
    subtotal: number,
  ): number {
    const value = Number(coupon.value);
    let discount =
      coupon.type === CouponType.PERCENT ? (subtotal * value) / 100 : value;

    if (coupon.type === CouponType.PERCENT && coupon.maxDiscount !== null) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }

    discount = Math.min(discount, subtotal);
    return this.roundMoney(discount);
  }

  private validateCouponValue(
    type: CouponType,
    value: number,
    maxDiscount?: number,
  ): void {
    if (type === CouponType.PERCENT) {
      if (value < 0 || value > 100) {
        throw new BadRequestException('Percent value must be between 0 and 100');
      }
    } else if (type === CouponType.FIXED) {
      if (value < 0) {
        throw new BadRequestException('Fixed discount must be non-negative');
      }
    }

    if (maxDiscount !== undefined && maxDiscount !== null && maxDiscount < 0) {
      throw new BadRequestException('max_discount must be non-negative');
    }
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private extractBearer(authorization: string | undefined): string | null {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }
    return authorization.slice(7).trim();
  }

  private roundMoney(n: number): number {
    return Math.round(n * 100) / 100;
  }

  private assertUuid(id: string, notFoundMessage: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException(notFoundMessage);
    }
  }

  private toCouponResponse(coupon: {
    id: string;
    code: string;
    type: CouponType;
    value: Prisma.Decimal;
    maxDiscount: Prisma.Decimal | null;
    minOrderAmount: Prisma.Decimal;
    usageLimit: number | null;
    usedCount: number;
    expiresAt: Date | null;
    isActive: boolean;
    createdAt: Date;
  }) {
    const valueNum = Number(coupon.value);
    const row: {
      id: string;
      code: string;
      discount_percent: number;
      discount_amount?: number;
      min_order_amount: number;
      max_discount_amount: number;
      usage_limit: number;
      used_count: number;
      expiry_date: string;
      created_at: string;
      is_active?: boolean;
    } = {
      id: coupon.id,
      code: coupon.code,
      discount_percent: coupon.type === CouponType.PERCENT ? valueNum : 0,
      min_order_amount: Number(coupon.minOrderAmount),
      max_discount_amount: Number(coupon.maxDiscount ?? 0),
      usage_limit: coupon.usageLimit ?? 0,
      used_count: coupon.usedCount,
      expiry_date: coupon.expiresAt ? coupon.expiresAt.toISOString() : '',
      created_at: coupon.createdAt.toISOString(),
      is_active: coupon.isActive,
    };

    if (coupon.type === CouponType.FIXED) {
      row.discount_amount = valueNum;
    }

    return row;
  }
}
