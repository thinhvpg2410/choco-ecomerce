import { Body, Controller, Delete, Param, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import {
  ReviewDetailResponseDto,
  ReviewListResponseDto,
} from './dto/review-response.dto';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Create a product review (delivered buyers only)' })
  @ApiBody({ type: CreateReviewDto })
  @ApiOkResponse({ type: ReviewDetailResponseDto })
  @Post()
  async create(@Req() request: Request, @Body() dto: CreateReviewDto) {
    const user = request.user as { sub: string };
    return this.reviewsService.create(user.sub, dto);
  }

  @ApiOperation({ summary: 'Update own review (or admin)' })
  @ApiBody({ type: UpdateReviewDto })
  @ApiOkResponse({ type: ReviewDetailResponseDto })
  @Put(':id')
  async update(
    @Req() request: Request,
    @Param('id') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const user = request.user as { sub: string; role: UserRole };
    return this.reviewsService.update(reviewId, user.sub, user.role, dto);
  }

  @ApiOperation({ summary: 'Delete own review (or admin)' })
  @ApiOkResponse({ description: 'Review deleted' })
  @Delete(':id')
  async remove(@Req() request: Request, @Param('id') reviewId: string) {
    const user = request.user as { sub: string; role: UserRole };
    return this.reviewsService.remove(reviewId, user.sub, user.role);
  }
}
