import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('ProductImages')
@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly service: ProductImagesService) {}

  @ApiQuery({ name: 'product_id', required: false })
  @Get()
  async findAll(@Query('product_id') productId?: string) {
    return this.service.findAll(productId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiBody({ type: CreateProductImageDto })
  async create(@Body() dto: CreateProductImageDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiBody({ type: UpdateProductImageDto })
  async update(@Param('id') id: string, @Body() dto: UpdateProductImageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
