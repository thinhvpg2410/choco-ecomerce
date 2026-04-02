import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma, Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';

type ProductWithCategory = Product & { category: Category };

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const search = query.search;
    const categoryId = query.category_id;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      success: true,
      message: 'Products fetched successfully',
      data: {
        items: products.map((product) => this.toProductResponse(product)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(productId: string) {
    this.validateProductId(productId);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      message: 'Product fetched successfully',
      data: this.toProductResponse(product),
    };
  }

  async create(createProductDto: CreateProductDto) {
    await this.ensureCategoryExists(createProductDto.category_id);
    const createdProduct = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        images: createProductDto.images ?? [],
        categoryId: createProductDto.category_id,
        isActive: createProductDto.is_active ?? true,
      },
      include: { category: true },
    });
    return {
      success: true,
      message: 'Product created successfully',
      data: this.toProductResponse(createdProduct),
    };
  }

  async update(productId: string, updateProductDto: UpdateProductDto) {
    this.validateProductId(productId);
    if (updateProductDto.category_id) {
      await this.ensureCategoryExists(updateProductDto.category_id);
    }

    const data: Prisma.ProductUpdateInput = {
      ...(updateProductDto.name !== undefined && { name: updateProductDto.name }),
      ...(updateProductDto.description !== undefined && {
        description: updateProductDto.description,
      }),
      ...(updateProductDto.price !== undefined && { price: updateProductDto.price }),
      ...(updateProductDto.stock !== undefined && { stock: updateProductDto.stock }),
      ...(updateProductDto.images !== undefined && { images: updateProductDto.images }),
      ...(updateProductDto.is_active !== undefined && {
        isActive: updateProductDto.is_active,
      }),
      ...(updateProductDto.category_id !== undefined && {
        category: { connect: { id: updateProductDto.category_id } },
      }),
    };

    const existing = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data,
      include: { category: true },
    });
    return {
      success: true,
      message: 'Product updated successfully',
      data: this.toProductResponse(updatedProduct),
    };
  }

  async remove(productId: string) {
    this.validateProductId(productId);
    const result = await this.prisma.product.updateMany({
      where: { id: productId, isActive: true },
      data: { isActive: false },
    });
    if (result.count === 0) {
      throw new NotFoundException('Product not found');
    }

    return { success: true, message: 'Product deleted successfully' };
  }

  private validateProductId(id: string): void {
    if (!isUuid(id)) {
      throw new NotFoundException('Product not found');
    }
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    if (!isUuid(categoryId)) {
      throw new NotFoundException('Category not found');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private toProductResponse(product: ProductWithCategory) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      images: product.images,
      category_id: product.categoryId,
      category_name: product.category.name,
      is_active: product.isActive,
      average_rating:
        product.averageRating === null ? null : Number(product.averageRating),
      review_count: product.reviewCount,
      createdAt: product.createdAt,
    };
  }
}
