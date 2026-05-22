import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Matches `apps/web/types/type.ts` Review */
export class ReviewItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  product_id: string;

  @ApiProperty()
  rating: number;

  @ApiPropertyOptional()
  comment?: string;

  @ApiProperty({ description: 'ISO string' })
  created_at: string;

  @ApiProperty()
  order_item_id: string;
}

export class ReviewListDataDto {
  @ApiProperty({ type: [ReviewItemDto] })
  items: ReviewItemDto[];

  @ApiProperty()
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ReviewListResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ReviewListDataDto })
  data: ReviewListDataDto;
}

export class ReviewDetailResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ReviewItemDto })
  data: ReviewItemDto;
}
