import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { JwtRequestUser } from '../../common/types/jwt-request-user';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(viewer?: JwtRequestUser) {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      message: 'Categories fetched successfully',
      data: categories.map((category) => this.toCategoryResponse(category)),
      ...(viewer && {
        meta: {
          viewer: {
            id: viewer.sub,
            email: viewer.email,
            role: viewer.role,
          },
        },
      }),
    };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const createdCategory = await this.prisma.category.create({
      data: createCategoryDto,
    });
    return {
      success: true,
      message: 'Category created successfully',
      data: this.toCategoryResponse(createdCategory),
    };
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    this.validateUuid(categoryId);
    try {
      const updatedCategory = await this.prisma.category.update({
        where: { id: categoryId },
        data: updateCategoryDto,
      });
      return {
        success: true,
        message: 'Category updated successfully',
        data: this.toCategoryResponse(updatedCategory),
      };
    } catch {
      throw new NotFoundException('Category not found');
    }
  }

  async remove(categoryId: string) {
    this.validateUuid(categoryId);

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingProducts = await this.prisma.product.count({
      where: { categoryId: category.id, isActive: true },
    });
    if (existingProducts > 0) {
      throw new BadRequestException('Cannot delete category with existing products');
    }

    await this.prisma.category.delete({ where: { id: categoryId } });
    return { success: true, message: 'Category deleted successfully' };
  }

  private validateUuid(id: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException('Category not found');
    }
  }

  private toCategoryResponse(category: Category) {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
    };
  }
}
