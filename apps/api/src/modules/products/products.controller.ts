import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ProductDetailResponseDto,
  ProductListResponseDto,
} from './dto/product-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';
import { OptionalUser } from '../../common/decorators/optional-user.decorator';
import type { JwtRequestUser } from '../../common/types/jwt-request-user';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'List products with search and pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiOkResponse({ type: ProductListResponseDto })
  @Public()
  @OptionalAuth()
  @Get()
  async findAll(
    @Query() query: QueryProductDto,
    @OptionalUser() user?: JwtRequestUser,
  ) {
    return this.productsService.findAll(query, user);
  }

  @ApiOperation({ summary: 'Get product by id' })
  @ApiOkResponse({ type: ProductDetailResponseDto })
  @Public()
  @OptionalAuth()
  @Get(':id')
  async findOne(
    @Param('id') productId: string,
    @OptionalUser() user?: JwtRequestUser,
  ) {
    return this.productsService.findOne(productId, user);
  }

  @ApiOperation({ summary: 'Create new product (admin only)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateProductDto })
  @ApiOkResponse({ type: ProductDetailResponseDto })
  @Roles(UserRole.admin)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Update product (admin only)' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({ type: ProductDetailResponseDto })
  @Roles(UserRole.admin)
  @Put(':id')
  async update(
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(productId, updateProductDto);
  }

  @ApiOperation({ summary: 'Soft delete product (admin only)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Product deleted' })
  @Roles(UserRole.admin)
  @Delete(':id')
  async remove(@Param('id') productId: string) {
    return this.productsService.remove(productId);
  }
}
