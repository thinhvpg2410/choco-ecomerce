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
        OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Lấy danh sách mã giảm giá thành công',
      data: coupons.map((c) => this.toCouponResponse(c)),
    };
  }

  async create(dto: CreateCouponDto) {
    this.validateCouponValue(dto.type, dto.value, dto.max_discount);
    const code = this.normalizeCode(dto.code);

    const data: any = {
      code,
      couponType: dto.type,
      minOrderAmount: dto.min_order_amount ?? 0,
      usageLimit: dto.usage_limit ?? null,
      expiryDate: dto.expires_at ? new Date(dto.expires_at) : null,
      isActive: dto.is_active ?? true,
    };

    if (dto.type === CouponType.PERCENT) {
      data.discountPercent = dto.value;
      data.discountAmount = null;
    } else if (dto.type === CouponType.FIXED) {
      data.discountAmount = dto.value;
      data.discountPercent = null;
    } else if (dto.type === CouponType.FREE_SHIP) {
      data.discountAmount = 0;
      data.discountPercent = null;
    }

    if (dto.max_discount !== undefined) {
      data.maxDiscountAmount = dto.max_discount;
    }

    try {
      const coupon = await this.prisma.coupon.create({
        data,
      });

      return {
        success: true,
        message: 'Mã giảm giá đã được tạo thành công',
        data: this.toCouponResponse(coupon),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Mã giảm giá đã tồn tại');
      }
      throw error;
    }
  }

  async update(couponId: string, dto: UpdateCouponDto) {
    this.assertUuid(couponId, 'Coupon not found');

    const existing = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });
    if (!existing) {
      throw new NotFoundException('Coupon not found');
    }

    const nextType = dto.type ?? existing.couponType;
    const nextValue =
      dto.value ??
      (nextType === CouponType.PERCENT
        ? Number(existing.discountPercent || 0)
        : Number(existing.discountAmount || 0));
    const nextMaxRaw =
      dto.max_discount !== undefined
        ? dto.max_discount
        : existing.maxDiscountAmount
          ? Number(existing.maxDiscountAmount)
          : null;
    const nextMax =
      nextMaxRaw === null || nextMaxRaw === undefined
        ? undefined
        : Number(nextMaxRaw);

    this.validateCouponValue(nextType, nextValue, nextMax);

    const data: any = {};
    if (dto.code !== undefined) data.code = this.normalizeCode(dto.code);
    if (dto.type !== undefined) data.couponType = dto.type;
    if (dto.value !== undefined || dto.type !== undefined) {
      const finalType = dto.type ?? existing.couponType;
      const finalValue = dto.value ?? 0;

      if (finalType === CouponType.PERCENT) {
        data.discountPercent = finalValue;
        data.discountAmount = null;
      } else if (finalType === CouponType.FIXED) {
        data.discountAmount = finalValue;
        data.discountPercent = null;
      } else if (finalType === CouponType.FREE_SHIP) {
        data.discountAmount = 0;
        data.discountPercent = null;
      }
    }
    if (dto.max_discount !== undefined)
      data.maxDiscountAmount = dto.max_discount;
    if (dto.min_order_amount !== undefined)
      data.minOrderAmount = dto.min_order_amount;
    if (dto.usage_limit !== undefined) data.usageLimit = dto.usage_limit;
    if (dto.expires_at !== undefined)
      data.expiryDate = dto.expires_at ? new Date(dto.expires_at) : null;
    if (dto.is_active !== undefined) data.isActive = dto.is_active;

    try {
      const coupon = await this.prisma.coupon.update({
        where: { id: couponId },
        data,
      });

      return {
        success: true,
        message: 'Mã giảm giá đã được cập nhật thành công',
        data: this.toCouponResponse(coupon),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Mã giảm giá đã tồn tại');
      }
      throw error;
    }
  }

  async remove(couponId: string) {
    this.assertUuid(couponId, 'Mã giảm giá không tồn tại');

    try {
      await this.prisma.coupon.delete({ where: { id: couponId } });
      return {
        success: true,
        message: 'Mã giảm giá đã được xóa thành công',
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Mã giảm giá không tồn tại');
      }
      throw error;
    }
  }

  async apply(authorization: string | undefined, dto: ApplyCouponDto) {
    const hasOrder = !!dto.order_id;
    const hasSubtotal = dto.subtotal !== undefined && dto.subtotal !== null;

    if (hasOrder === hasSubtotal) {
      throw new BadRequestException(
        'Provide exactly one of order_id or subtotal',
      );
    }

    let userId: string | undefined;
    if (hasOrder) {
      const token = this.extractBearer(authorization);
      if (!token) {
        throw new UnauthorizedException(
          'Authorization required when using order_id',
        );
      }
      userId = this.authService.verifyAccessToken(token).sub;
    }

    const code = this.normalizeCode(dto.code);
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Mã giảm giá không hợp lệ');
    }

    const now = new Date();
    if (coupon.expiryDate && coupon.expiryDate <= now) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    let subtotal: number;
    if (hasOrder && dto.order_id && userId) {
      const order = await this.prisma.order.findFirst({
        where: { id: dto.order_id, userId },
      });
      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }
      subtotal = Number(order.totalAmount);
    } else {
      subtotal = Number(dto.subtotal);
    }

    const minOrder = Number(coupon.minOrderAmount);
    if (subtotal < minOrder) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${minOrder.toLocaleString('vi-VN')}đ để áp dụng mã này`,
      );
    }

    const discount = this.computeDiscount(
      {
        type: coupon.couponType,
        value:
          (coupon.couponType === CouponType.PERCENT
            ? coupon.discountPercent
            : coupon.discountAmount) || new Prisma.Decimal(0),
        maxDiscount: coupon.maxDiscountAmount,
      },
      subtotal,
    );
    const finalAmount = this.roundMoney(Math.max(0, subtotal - discount));

    return {
      success: true,
      message: 'Mã giảm giá đã được áp dụng thành công',
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

    let discount = 0;

    if (coupon.type === CouponType.PERCENT) {
      discount = (subtotal * value) / 100;
    } else if (coupon.type === CouponType.FIXED) {
      discount = value;
    } else if (coupon.type === CouponType.FREE_SHIP) {
      // freeship mặc định 30000
      discount = 30000;
    }

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
    {
      if (type === CouponType.PERCENT) {
        if (value < 0 || value > 100) {
          throw new BadRequestException(
            'Giá trị phần trăm phải nằm trong khoảng từ 0 đến 100',
          );
        }
      } else if (type === CouponType.FIXED) {
        if (value < 0) {
          throw new BadRequestException(
            'Giá trị giảm giá cố định phải là số không âm',
          );
        }
      } else if (type === CouponType.FREE_SHIP) {
        if (value !== 0) {
          throw new BadRequestException('Giá trị FREE_SHIP phải là 0');
        }
      }

      if (
        maxDiscount !== undefined &&
        maxDiscount !== null &&
        maxDiscount < 0
      ) {
        throw new BadRequestException(
          'Giá trị giảm giá tối đa phải là số không âm',
        );
      }
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
    couponType: CouponType;
    discountPercent: Prisma.Decimal | null;
    discountAmount: Prisma.Decimal | null;
    maxDiscountAmount: Prisma.Decimal | null;
    minOrderAmount: Prisma.Decimal;
    usageLimit: number | null;
    usedCount: number;
    expiryDate: Date | null;
    isActive: boolean;
    createdAt: Date;
  }) {
    const discountPercentNum = coupon.discountPercent
      ? Number(coupon.discountPercent)
      : 0;
    const discountAmountNum = coupon.discountAmount
      ? Number(coupon.discountAmount)
      : 0;
    const row: {
      id: string;
      code: string;
      type: CouponType;
      value: number;
      maxDiscount: number | null;
      minOrderAmount: number;
      usageLimit: number | null;
      usedCount: number;
      expiresAt: string | null;
      isActive: boolean;
      createdAt: string;
    } = {
      id: coupon.id,
      code: coupon.code,
      type: coupon.couponType,
      value:
        coupon.couponType === CouponType.PERCENT
          ? discountPercentNum
          : coupon.couponType === CouponType.FIXED
            ? discountAmountNum
            : 0,
      maxDiscount: coupon.maxDiscountAmount
        ? Number(coupon.maxDiscountAmount)
        : null,
      minOrderAmount: Number(coupon.minOrderAmount),
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      expiresAt: coupon.expiryDate ? coupon.expiryDate.toISOString() : null,
      isActive: coupon.isActive,
      createdAt: coupon.createdAt.toISOString(),
    };
    return row;
  }
}
