import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicResponseMetaDto } from '../../../common/dto/viewer-meta.dto';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;
}

export class CategoryListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [CategoryResponseDto] })
  data: CategoryResponseDto[];

  @ApiPropertyOptional({ type: PublicResponseMetaDto })
  meta?: PublicResponseMetaDto;
}

export class CategoryDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: CategoryResponseDto })
  data: CategoryResponseDto;
}
