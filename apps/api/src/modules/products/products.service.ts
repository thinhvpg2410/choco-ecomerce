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
  slug: true,
  shortDescription: true,
  description: true,
  sku: true,
  price: true,
  salePrice: true,
  costPrice: true,
  stock: true,
  imageUrl: true,
  images: true,
  categoryId: true,
  brandId: true,
  ingredients: true,
  nutritionInfo: true,
  origin: true,
  weight: true,
  weightUnit: true,
  packageType: true,
  isActive: true,
  isFeatured: true,
  isBestSeller: true,
  isNew: true,
  createdAt: true,
  updatedAt: true,
  averageRating: true,
  reviewCount: true,
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
} satisfies Prisma.ProductSelect;

type ProductPublicRow = Prisma.ProductGetPayload<{ select: typeof productPublicSelect }>;

type ProductResponseSource = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  sku: string;
  price: Prisma.Decimal;
  salePrice: Prisma.Decimal | null;
  costPrice: Prisma.Decimal | null;
  stock: number;
  imageUrl: string;
  images: string[];
  categoryId: string;
  brandId: string | null;
  ingredients: string | null;
  nutritionInfo: Prisma.JsonValue | null;
  origin: string | null;
  weight: Prisma.Decimal;
  weightUnit: string;
  packageType: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  averageRating: Prisma.Decimal | null;
  reviewCount: number;
  category: { id: string; name: string };
  brand: { id: string; name: string } | null;
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

    const cacheKey = this.cache.productsListKey(
      page,
      limit,
      search,
      categoryId,
    );
    type GuestListPayload = Awaited<
      ReturnType<ProductsService['loadGuestListPayload']>
    >;
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
    type GuestDetailPayload = ReturnType<
      ProductsService['buildGuestDetailPayload']
    >;
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
    if (createProductDto.brand_id) {
      await this.ensureBrandExists(createProductDto.brand_id);
    }

    const createdProduct = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        slug: createProductDto.slug,
        shortDescription: createProductDto.short_description,
        description: createProductDto.description,
        sku: createProductDto.sku,
        price: createProductDto.price,
        salePrice: createProductDto.sale_price,
        costPrice: createProductDto.cost_price,
        stock: createProductDto.stock,
        imageUrl: createProductDto.image_url,
        images: createProductDto.images ?? [],
        categoryId: createProductDto.category_id,
        brandId: createProductDto.brand_id,
        ingredients: createProductDto.ingredients,
        nutritionInfo: createProductDto.nutrition_info,
        origin: createProductDto.origin,
        weight: createProductDto.weight,
        weightUnit: createProductDto.weight_unit,
        packageType: createProductDto.package_type,
        isActive: createProductDto.is_active ?? true,
        isFeatured: createProductDto.is_featured ?? false,
        isBestSeller: createProductDto.is_best_seller ?? false,
        isNew: createProductDto.is_new ?? false,
      },
      include: { category: true, brand: true },
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
    if (updateProductDto.brand_id) {
      await this.ensureBrandExists(updateProductDto.brand_id);
    }

    const data: Prisma.ProductUpdateInput = {
      ...(updateProductDto.name !== undefined && {
        name: updateProductDto.name,
      }),
      ...(updateProductDto.slug !== undefined && {
        slug: updateProductDto.slug,
      }),
      ...(updateProductDto.short_description !== undefined && {
        shortDescription: updateProductDto.short_description,
      }),
      ...(updateProductDto.description !== undefined && {
        description: updateProductDto.description,
      }),
      ...(updateProductDto.sku !== undefined && { sku: updateProductDto.sku }),
      ...(updateProductDto.price !== undefined && {
        price: updateProductDto.price,
      }),
      ...(updateProductDto.sale_price !== undefined && {
        salePrice: updateProductDto.sale_price,
      }),
      ...(updateProductDto.cost_price !== undefined && {
        costPrice: updateProductDto.cost_price,
      }),
      ...(updateProductDto.stock !== undefined && {
        stock: updateProductDto.stock,
      }),
      ...(updateProductDto.image_url !== undefined && {
        imageUrl: updateProductDto.image_url,
      }),
      ...(updateProductDto.images !== undefined && {
        images: updateProductDto.images,
      }),
      ...(updateProductDto.brand_id !== undefined && {
        brand: { connect: { id: updateProductDto.brand_id } },
      }),
      ...(updateProductDto.ingredients !== undefined && {
        ingredients: updateProductDto.ingredients,
      }),
      ...(updateProductDto.nutrition_info !== undefined && {
        nutritionInfo: updateProductDto.nutrition_info,
      }),
      ...(updateProductDto.origin !== undefined && {
        origin: updateProductDto.origin,
      }),
      ...(updateProductDto.weight !== undefined && {
        weight: updateProductDto.weight,
      }),
      ...(updateProductDto.weight_unit !== undefined && {
        weightUnit: updateProductDto.weight_unit,
      }),
      ...(updateProductDto.package_type !== undefined && {
        packageType: updateProductDto.package_type,
      }),
      ...(updateProductDto.is_active !== undefined && {
        isActive: updateProductDto.is_active,
      }),
      ...(updateProductDto.is_featured !== undefined && {
        isFeatured: updateProductDto.is_featured,
      }),
      ...(updateProductDto.is_best_seller !== undefined && {
        isBestSeller: updateProductDto.is_best_seller,
      }),
      ...(updateProductDto.is_new !== undefined && {
        isNew: updateProductDto.is_new,
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
      include: { category: true, brand: true },
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

  private async findAllForViewer(
    query: QueryProductDto,
    viewer: JwtRequestUser,
  ) {
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
    const limit = Number(query.limit ?? 12);
    const search = (query.search ?? '').trim();
    const categoryId = query.category_id;
    const brandId = query.brand_id;
    const minPrice = query.min_price;
    const maxPrice = query.max_price;
    const isFeatured = query.is_featured;
    const isBestSeller = query.is_best_seller;
    const isNew = query.is_new;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,

      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),

      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),

      // Lọc theo giá
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),

      // Lọc theo trạng thái đặc biệt
      ...(isFeatured !== undefined && { isFeatured }),
      ...(isBestSeller !== undefined && { isBestSeller }),
      ...(isNew !== undefined && { isNew }),
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

  private async getCartQuantitiesByProductId(
    userId: string,
  ): Promise<Map<string, number>> {
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

  private async ensureBrandExists(brandId: string): Promise<void> {
    if (!isUuid(brandId)) {
      throw new NotFoundException('Brand not found');
    }

    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
  }

  private toProductResponse(product: ProductResponseSource) {
    const p = product;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      short_description: p.shortDescription,
      description: p.description,
      sku: p.sku,
      price: Number(p.price),
      sale_price: p.salePrice === null ? null : Number(p.salePrice),
      cost_price: p.costPrice === null ? null : Number(p.costPrice),
      stock: p.stock,
      image_url: p.imageUrl,
      category_id: p.categoryId,
      brand_id: p.brandId,
      ingredients: p.ingredients ?? undefined,
      nutrition_info: p.nutritionInfo ?? undefined,
      origin: p.origin ?? undefined,
      weight: Number(p.weight),
      weight_unit: p.weightUnit,
      package_type: p.packageType,
      is_active: p.isActive,
      is_featured: p.isFeatured,
      is_best_seller: p.isBestSeller,
      is_new: p.isNew,
      average_rating: p.averageRating === null ? null : Number(p.averageRating),
      review_count: p.reviewCount,
      created_at: p.createdAt,
      updated_at: p.updatedAt ?? undefined,
    };
  }
}
