import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicResponseMetaDto } from '../../../common/dto/viewer-meta.dto';

export class MyReviewSnippetDto {
  @ApiProperty()
  rating: number;

  @ApiProperty({ required: false, nullable: true })
  comment: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  stock: number;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  category_id: string;

  @ApiProperty({ required: false })
  category_name?: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty({ required: false, nullable: true })
  average_rating: number | null;

  @ApiProperty()
  review_count: number;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'When authenticated (list): units of this product in your cart',
  })
  cart_quantity?: number;

  @ApiPropertyOptional({
    type: MyReviewSnippetDto,
    nullable: true,
    description: 'When authenticated (detail): your review for this product, if any',
  })
  my_review?: MyReviewSnippetDto | null;
}

export class ProductPaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class ProductListDataDto {
  @ApiProperty({ type: [ProductResponseDto] })
  items: ProductResponseDto[];

  @ApiProperty({ type: ProductPaginationDto })
  pagination: ProductPaginationDto;
}

export class ProductListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ProductListDataDto })
  data: ProductListDataDto;

  @ApiPropertyOptional({ type: PublicResponseMetaDto })
  meta?: PublicResponseMetaDto;
}

export class ProductDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ProductResponseDto })
  data: ProductResponseDto;

  @ApiPropertyOptional({ type: PublicResponseMetaDto })
  meta?: PublicResponseMetaDto;
}
