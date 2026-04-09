import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('ProductVariants')
@Controller('product-variants')
export class ProductVariantsController {
  constructor(private readonly service: ProductVariantsService) {}

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
  @ApiBody({ type: CreateProductVariantDto })
  async create(@Body() dto: CreateProductVariantDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiBody({ type: UpdateProductVariantDto })
  async update(@Param('id') id: string, @Body() dto: UpdateProductVariantDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
