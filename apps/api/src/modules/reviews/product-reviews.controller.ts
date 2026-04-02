import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { ReviewListResponseDto } from './dto/review-response.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'List reviews for a product' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ type: ReviewListResponseDto })
  @Public()
  @Get(':id/reviews')
  async listByProduct(
    @Param('id') productId: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.reviewsService.findByProduct(productId, query);
  }
}
