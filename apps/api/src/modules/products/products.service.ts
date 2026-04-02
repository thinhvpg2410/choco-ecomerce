import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtRequestUser } from '../../common/types/jwt-request-user';
import { CacheService } from '../../common/cache/cache.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';

const productPublicSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  images: true,
  categoryId: true,
  isActive: true,
  averageRating: true,
  reviewCount: true,
  createdAt: true,
  category: { select: { id: true, name: true } },
} satisfies Prisma.ProductSelect;

type ProductPublicRow = Prisma.ProductGetPayload<{ select: typeof productPublicSelect }>;

type ProductResponseSource = {
  id: string;
  name: string;
  description: string;
  price: Prisma.Decimal;
  stock: number;
  images: string[];
  categoryId: string;
  isActive: boolean;
  averageRating: Prisma.Decimal | null;
  reviewCount: number;
  createdAt: Date;
  category: { name: string };
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(query: QueryProductDto, viewer?: JwtRequestUser) {
    if (viewer) {
      return this.findAllForViewer(query, viewer);
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const search = (query.search ?? '').trim();
    const categoryId = query.category_id ?? '';

    const cacheKey = this.cache.productsListKey(page, limit, search, categoryId);
    type GuestListPayload = Awaited<ReturnType<ProductsService['loadGuestListPayload']>>;
    const cached = await this.cache.get<GuestListPayload>(cacheKey);
    if (cached) {
      return cached;
    }

    const payload = await this.loadGuestListPayload(query);
    await this.cache.set(cacheKey, payload, this.cache.ttl.productsList);
    return payload;
  }

  async findOne(productId: string, viewer?: JwtRequestUser) {
    this.validateProductId(productId);
    if (viewer) {
      return this.findOneForViewer(productId, viewer);
    }

    const cacheKey = this.cache.productDetailKey(productId);
    type GuestDetailPayload = ReturnType<ProductsService['buildGuestDetailPayload']>;
    const cached = await this.cache.get<GuestDetailPayload>(cacheKey);
    if (cached) {
      return cached;
    }

    const payload = await this.loadGuestDetailPayload(productId);
    await this.cache.set(cacheKey, payload, this.cache.ttl.productDetail);
    return payload;
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
    await this.cache.invalidateAfterProductWrite(createdProduct.id);
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
    await this.cache.invalidateAfterProductWrite(productId);
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

    await this.cache.invalidateAfterProductWrite(productId);
    return { success: true, message: 'Product deleted successfully' };
  }

  private async findAllForViewer(query: QueryProductDto, viewer: JwtRequestUser) {
    const payload = await this.loadGuestListPayload(query);
    const cartByProduct = await this.getCartQuantitiesByProductId(viewer.sub);
    return {
      ...payload,
      data: {
        ...payload.data,
        items: payload.data.items.map((item) => ({
          ...item,
          cart_quantity: cartByProduct.get(item.id) ?? 0,
        })),
      },
      meta: {
        viewer: {
          id: viewer.sub,
          email: viewer.email,
          role: viewer.role,
        },
      },
    };
  }

  private async loadGuestListPayload(query: QueryProductDto) {
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
        select: productPublicSelect,
      }),
      this.prisma.product.count({ where }),
    ]);

    return this.buildGuestListPayload(products, page, limit, total);
  }

  private buildGuestListPayload(
    products: ProductPublicRow[],
    page: number,
    limit: number,
    total: number,
  ) {
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

  private async findOneForViewer(productId: string, viewer: JwtRequestUser) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: productPublicSelect,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const myReview = await this.prisma.review.findUnique({
      where: {
        userId_productId: { userId: viewer.sub, productId: product.id },
      },
    });

    const base = this.toProductResponse(product);
    return {
      success: true,
      message: 'Product fetched successfully',
      data: {
        ...base,
        my_review: myReview
          ? {
              rating: myReview.rating,
              comment: myReview.comment,
              createdAt: myReview.createdAt,
            }
          : null,
      },
      meta: {
        viewer: {
          id: viewer.sub,
          email: viewer.email,
          role: viewer.role,
        },
      },
    };
  }

  private async loadGuestDetailPayload(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: productPublicSelect,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.buildGuestDetailPayload(product);
  }

  private buildGuestDetailPayload(product: ProductPublicRow) {
    const base = this.toProductResponse(product);
    return {
      success: true,
      message: 'Product fetched successfully',
      data: base,
    };
  }

  private async getCartQuantitiesByProductId(userId: string): Promise<Map<string, number>> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    const map = new Map<string, number>();
    if (!cart) {
      return map;
    }
    for (const item of cart.items) {
      map.set(item.productId, item.quantity);
    }
    return map;
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

  private toProductResponse(product: ProductResponseSource) {
    const p = product;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      stock: p.stock,
      images: p.images,
      category_id: p.categoryId,
      category_name: p.category.name,
      is_active: p.isActive,
      average_rating:
        p.averageRating === null ? null : Number(p.averageRating),
      review_count: p.reviewCount,
      createdAt: p.createdAt,
    };
  }
}
