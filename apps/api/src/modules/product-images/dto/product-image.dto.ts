import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class ProductImageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  image_url: string;

  @ApiPropertyOptional()
  sort_order?: number;

  @ApiPropertyOptional()
  is_main?: boolean;

  @ApiProperty()
  created_at: string;
}
