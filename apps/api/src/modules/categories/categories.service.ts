import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { JwtRequestUser } from '../../common/types/jwt-request-user';
import { CacheService } from '../../common/cache/cache.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(viewer?: JwtRequestUser) {
    if (viewer) {
      const categories = await this.prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, description: true, createdAt: true },
      });
      return {
        success: true,
        message: 'Categories fetched successfully',
        data: categories.map((category) => this.toCategoryResponse(category)),
        meta: {
          viewer: {
            id: viewer.sub,
            email: viewer.email,
            role: viewer.role,
          },
        },
      };
    }

    const cacheKey = this.cache.categoriesKey();
    type Payload = Awaited<ReturnType<CategoriesService['loadGuestCategories']>>;
    const cached = await this.cache.get<Payload>(cacheKey);
    if (cached) {
      return cached;
    }

    const payload = await this.loadGuestCategories();
    await this.cache.set(cacheKey, payload, this.cache.ttl.categories);
    return payload;
  }

  private async loadGuestCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, createdAt: true },
    });
    return {
      success: true,
      message: 'Categories fetched successfully',
      data: categories.map((category) => this.toCategoryResponse(category)),
    };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const createdCategory = await this.prisma.category.create({
      data: createCategoryDto,
    });
    await this.cache.invalidateAfterCategoryWrite();
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
      await this.cache.invalidateAfterCategoryWrite();
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
    await this.cache.invalidateAfterCategoryWrite();
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
