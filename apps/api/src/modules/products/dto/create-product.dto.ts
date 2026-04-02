import {
  ArrayMinSize,
  IsArray,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images: string[];

  @ApiProperty()
  @IsUUID('4')
  category_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  is_active?: boolean;
}
