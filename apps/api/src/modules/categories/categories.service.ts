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
import { UploadService } from '../../common/upload/upload.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(viewer?: JwtRequestUser) {
    if (viewer) {
      const categories = await this.prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          parentId: true,
          sortOrder: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return {
        success: true,
        message: 'Lấy danh sách danh mục thành công',
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
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: categories.map((category) => this.toCategoryResponse(category)),
    };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const createdCategory = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug: createCategoryDto.slug,
        description: createCategoryDto.description ?? '',
        imageUrl: createCategoryDto.image_url,
        parentId: createCategoryDto.parent_id,
        sortOrder: createCategoryDto.sort_order,
        isActive: createCategoryDto.is_active ?? true,
      },
    });
    await this.cache.invalidateAfterCategoryWrite();
    return {
      success: true,
      message: 'Tạo danh mục thành công',
      data: this.toCategoryResponse(createdCategory),
    };
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    this.validateUuid(categoryId);
    try {
      const updatedCategory = await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          ...(updateCategoryDto.name !== undefined && { name: updateCategoryDto.name }),
          ...(updateCategoryDto.slug !== undefined && { slug: updateCategoryDto.slug }),
          ...(updateCategoryDto.description !== undefined && {
            description: updateCategoryDto.description,
          }),
          ...(updateCategoryDto.image_url !== undefined && {
            imageUrl: updateCategoryDto.image_url,
          }),
          ...(updateCategoryDto.parent_id !== undefined && {
            parentId: updateCategoryDto.parent_id,
          }),
          ...(updateCategoryDto.sort_order !== undefined && {
            sortOrder: updateCategoryDto.sort_order,
          }),
          ...(updateCategoryDto.is_active !== undefined && {
            isActive: updateCategoryDto.is_active,
          }),
        },
      });
      await this.cache.invalidateAfterCategoryWrite();
      return {
        success: true,
        message: 'Cập nhật danh mục thành công',
        data: this.toCategoryResponse(updatedCategory),
      };
    } catch {
      throw new NotFoundException('Danh mục không tồn tại');
    }
  }

  async remove(categoryId: string) {
    this.validateUuid(categoryId);

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    const existingProducts = await this.prisma.product.count({
      where: { categoryId: category.id, isActive: true },
    });
    if (existingProducts > 0) {
      throw new BadRequestException('Không thể xóa danh mục có sản phẩm đang tồn tại');
    }

    await this.prisma.category.delete({ where: { id: categoryId } });
    await this.cache.invalidateAfterCategoryWrite();
    return { success: true, message: 'Danh mục đã được xóa thành công' };
  }
  async uploadImage(categoryId: string, file: Express.Multer.File): Promise<any> {
    this.validateUuid(categoryId);
    const imageUrl = await this.uploadService.uploadImage(file, 'categories');
    const updatedCategory = await this.prisma.category.update({
      where: { id: categoryId },
      data: { imageUrl },
    });
    await this.cache.invalidateAfterCategoryWrite();
    return {
      success: true,
      message: 'Hình ảnh danh mục đã được tải lên thành công',
      data: this.toCategoryResponse(updatedCategory),
    };
  }


  private validateUuid(id: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException('Danh mục không tồn tại');
    }
  }

  private toCategoryResponse(category: Category) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.imageUrl,
      parent_id: category.parentId,
      sort_order: category.sortOrder,
      is_active: category.isActive,
      created_at: category.createdAt,
      updated_at: category.updatedAt,
    };
  }
}
