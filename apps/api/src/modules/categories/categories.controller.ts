import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CategoryDetailResponseDto,
  CategoryListResponseDto,
} from './dto/category-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';
import { OptionalUser } from '../../common/decorators/optional-user.decorator';
import type { JwtRequestUser } from '../../common/types/jwt-request-user';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({ type: CategoryListResponseDto })
  @Public()
  @OptionalAuth()
  @Get()
  async findAll(@OptionalUser() user?: JwtRequestUser) {
    return this.categoriesService.findAll(user);
  }

  @ApiOperation({ summary: 'Create category (admin only)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateCategoryDto })
  @ApiOkResponse({ type: CategoryDetailResponseDto })
  @Roles(UserRole.admin)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Update category (admin only)' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({ type: CategoryDetailResponseDto })
  @Roles(UserRole.admin)
  @Put(':id')
  async update(
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(categoryId, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Delete category (admin only)' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Category deleted' })
  @Roles(UserRole.admin)
  @Delete(':id')
  async remove(@Param('id') categoryId: string) {
    return this.categoriesService.remove(categoryId);
  }
}
