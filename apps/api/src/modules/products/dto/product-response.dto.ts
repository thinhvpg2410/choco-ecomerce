import { ApiProperty } from '@nestjs/swagger';

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
}

export class ProductDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ProductResponseDto })
  data: ProductResponseDto;
}
