import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import {
  ApplyCouponResponseDto,
  CouponDetailResponseDto,
  CouponListResponseDto,
} from './dto/coupon-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @ApiOperation({ summary: 'List active coupons (public)' })
  @ApiOkResponse({ type: CouponListResponseDto })
  @Public()
  @Get()
  async findAll() {
    return this.couponsService.findPublicList();
  }

  @ApiOperation({ summary: 'Validate coupon and compute discount' })
  @ApiBody({ type: ApplyCouponDto })
  @ApiOkResponse({ type: ApplyCouponResponseDto })
  @Public()
  @Post('apply')
  async apply(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.couponsService.apply(authorization, dto);
  }

  @ApiOperation({ summary: 'Create coupon (admin)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateCouponDto })
  @ApiOkResponse({ type: CouponDetailResponseDto })
  @Roles(UserRole.admin)
  @Post()
  async create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @ApiOperation({ summary: 'Update coupon (admin)' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateCouponDto })
  @ApiOkResponse({ type: CouponDetailResponseDto })
  @Roles(UserRole.admin)
  @Put(':id')
  async update(@Param('id') couponId: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(couponId, dto);
  }

  @ApiOperation({ summary: 'Delete coupon (admin)' })
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @Delete(':id')
  async remove(@Param('id') couponId: string) {
    return this.couponsService.remove(couponId);
  }
}
