import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
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

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({ type: CategoryListResponseDto })
  @Public()
  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: 'Create category (admin only)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateCategoryDto })
  @ApiOkResponse({ type: CategoryDetailResponseDto })
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Update category (admin only)' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({ type: CategoryDetailResponseDto })
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') categoryId: string) {
    return this.categoriesService.remove(categoryId);
  }
}
