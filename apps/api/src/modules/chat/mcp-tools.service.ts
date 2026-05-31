// chat/mcp-tools.service.ts
//

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchConstraints } from './types/search.types';

// ─────────────────────────────────────────────────────────────────────────────

const MAX_LIMIT = 10;

function levenshteinDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return dp[a.length][b.length];
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class MCPToolsService {
  constructor(private prisma: PrismaService) {}

  // ── SELECT cho list sản phẩm (nhẹ, dùng trong search/list) ───────────────
  private readonly productListSelect = {
    id: true,
    name: true,
    price: true,
    salePrice: true,
    imageUrl: true,
    stock: true,
    origin: true,
    isBestSeller: true,
    isNew: true,
    isFeatured: true,
    averageRating: true,
    reviewCount: true,
    brand: { select: { name: true } },
    category: { select: { name: true } },
  } as const;

  // ── SELECT chi tiết (dùng cho detail / stock check / review) ─────────────
  // Chỉ gồm các field THỰC SỰ có trong Prisma schema Product
  private readonly productDetailSelect = {
    id: true,
    name: true,
    price: true,
    salePrice: true,
    imageUrl: true,
    images: true,
    stock: true,
    origin: true,
    isBestSeller: true,
    isNew: true,
    isFeatured: true,
    averageRating: true,
    reviewCount: true,
    shortDescription: true,
    description: true,
    ingredients: true, // ✅ có trong schema
    nutritionInfo: true, // ✅ có trong schema (Json)
    weight: true,
    weightUnit: true,
    // packageType  ← KHÔNG có trong schema → đã xóa
    // expiryDays   ← KHÔNG có trong schema → đã xóa
    brand: { select: { name: true } },
    category: { select: { name: true } },
  } as const;

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: UNIFIED SEARCH
  // Hàm duy nhất cho PRODUCT_SEARCH — xử lý toàn bộ constraints + fallback
  // ─────────────────────────────────────────────────────────────────────────

  async executeUnifiedSearch(
    constraints: SearchConstraints,
  ): Promise<{ count: number; products: any[] }> {
    const {
      keyword,
      brand_name,
      category_name,
      origin,
      imported,
      semantic_keywords,
      min_price,
      max_price,
      sort_by,
      limit = 5,
    } = constraints;

    const safeLimit = Math.min(limit, MAX_LIMIT);
    const andClauses: any[] = [];

    // ── Keyword (chỉ dùng nếu có nghĩa — > 1 ký tự sau normalize) ──────
    const cleanKeyword = keyword?.trim();
    if (cleanKeyword && cleanKeyword.length > 1) {
      andClauses.push({
        OR: [
          { name: { contains: cleanKeyword, mode: 'insensitive' } },
          { shortDescription: { contains: cleanKeyword, mode: 'insensitive' } },
        ],
      });
    }

    // ── Brand ──────────────────────────────────────────────────────────────
    if (brand_name) {
      andClauses.push({
        brand: { name: { contains: brand_name, mode: 'insensitive' } },
      });
    }

    // ── Category ───────────────────────────────────────────────────────────
    if (category_name) {
      andClauses.push({
        category: { name: { contains: category_name, mode: 'insensitive' } },
      });
    }

    // ── Origin ─────────────────────────────────────────────────────────────
    if (origin) {
      andClauses.push({ origin: { contains: origin, mode: 'insensitive' } });
    }

    // ── Imported goods ─────────────────────────────────────────────────────
    if (imported) {
      andClauses.push({
        origin: { not: { contains: 'Việt Nam', mode: 'insensitive' } },
      });
    }

    // ── Semantic keywords ──────────────────────────────────────────────────
    if (semantic_keywords?.length) {
      andClauses.push({
        OR: semantic_keywords.flatMap((kw) => [
          { name: { contains: kw, mode: 'insensitive' } },
          { shortDescription: { contains: kw, mode: 'insensitive' } },
        ]),
      });
    }

    // ── Price filter ───────────────────────────────────────────────────────
    if (min_price !== undefined || max_price !== undefined) {
      const priceFilter: any = {};
      if (min_price !== undefined) priceFilter.gte = min_price;
      if (max_price !== undefined) priceFilter.lte = max_price;
      // Ưu tiên salePrice nếu có, fallback về price
      andClauses.push({
        OR: [
          { salePrice: { not: null, ...priceFilter } },
          { AND: [{ salePrice: null }, { price: priceFilter }] },
        ],
      });
    }

    // ── Boolean flag filter (isBestSeller / isNew / isFeatured) ───────────
    const flagMap: Record<string, string> = {
      isBestSeller: 'isBestSeller',
      isNew: 'isNew',
      isFeatured: 'isFeatured',
    };
    if (sort_by && flagMap[sort_by]) {
      andClauses.push({ [flagMap[sort_by]]: true });
    }

    // ── OrderBy ────────────────────────────────────────────────────────────
    let orderBy: any = { createdAt: 'desc' };
    if (sort_by === 'price_asc') orderBy = { price: 'asc' };
    else if (sort_by === 'price_desc') orderBy = { price: 'desc' };
    else if (sort_by === 'isBestSeller')
      orderBy = [{ reviewCount: 'desc' }, { averageRating: 'desc' }];
    else if (sort_by === 'isNew') orderBy = { createdAt: 'desc' };
    else if (sort_by === 'isFeatured')
      orderBy = [{ averageRating: 'desc' }, { reviewCount: 'desc' }];

    const where: any = {
      isActive: true,
      ...(andClauses.length ? { AND: andClauses } : {}),
    };

    let products = await this.prisma.product.findMany({
      where,
      select: this.productListSelect,
      take: safeLimit,
      orderBy,
    });

    console.log(
      `[executeUnifiedSearch] direct hit: ${products.length}`,
      JSON.stringify(constraints),
    );

    // ── Fallback 1: flag không có data → bỏ flag, giữ filters còn lại ─────
    if (products.length === 0 && sort_by && flagMap[sort_by]) {
      const withoutFlag = andClauses.filter((c) => !c[flagMap[sort_by!]]);
      const whereFallback: any = {
        isActive: true,
        ...(withoutFlag.length ? { AND: withoutFlag } : {}),
      };
      products = await this.prisma.product.findMany({
        where: whereFallback,
        select: this.productListSelect,
        take: safeLimit,
        orderBy,
      });
      console.log(`[executeUnifiedSearch] flag-fallback: ${products.length}`);
    }

    // ── Fallback 2: chỉ keyword, không ra → fuzzy Levenshtein ─────────────
    // Điều kiện: keyword phải có nghĩa (> 2 ký tự), không có filter phụ nào
    if (
      products.length === 0 &&
      cleanKeyword &&
      cleanKeyword.length > 2 &&
      !brand_name &&
      !category_name &&
      !origin &&
      !semantic_keywords?.length &&
      min_price === undefined &&
      max_price === undefined
    ) {
      console.log(
        `[executeUnifiedSearch] fuzzy-fallback for: "${cleanKeyword}"`,
      );
      const candidates = await this.prisma.product.findMany({
        where: { isActive: true },
        select: this.productListSelect,
        take: 300,
        orderBy: { reviewCount: 'desc' },
      });
      products = candidates
        .map((p) => ({
          p,
          score: levenshteinDistance(
            cleanKeyword.toLowerCase(),
            p.name.toLowerCase(),
          ),
        }))
        .filter((x) => x.score <= Math.ceil(cleanKeyword.length * 0.4)) // threshold tỉ lệ với độ dài
        .sort((a, b) => a.score - b.score)
        .slice(0, safeLimit)
        .map((x) => x.p);
      console.log(`[executeUnifiedSearch] fuzzy result: ${products.length}`);
    }

    return { count: products.length, products };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: PRODUCT DETAIL
  // Tìm exact match trước → substring match sau
  // ─────────────────────────────────────────────────────────────────────────

  async getProductDetail(
    keyword: string,
  ): Promise<{ found: boolean; product?: any; message?: string }> {
    if (!keyword?.trim()) {
      return { found: false, message: 'Cần tên sản phẩm' };
    }

    const kw = keyword.trim();

    // 1. Exact match tên (case-insensitive)
    let product = await this.prisma.product.findFirst({
      where: {
        isActive: true,
        name: { equals: kw, mode: 'insensitive' },
      },
      select: this.productDetailSelect,
    });

    // 2. Substring match tên
    if (!product) {
      product = await this.prisma.product.findFirst({
        where: {
          isActive: true,
          name: { contains: kw, mode: 'insensitive' },
        },
        select: this.productDetailSelect,
        orderBy: { reviewCount: 'desc' }, // ưu tiên sản phẩm nhiều review nhất
      });
    }

    // 3. Substring match shortDescription
    if (!product) {
      product = await this.prisma.product.findFirst({
        where: {
          isActive: true,
          shortDescription: { contains: kw, mode: 'insensitive' },
        },
        select: this.productDetailSelect,
        orderBy: { reviewCount: 'desc' },
      });
    }

    if (!product) {
      return { found: false, message: `Không tìm thấy sản phẩm "${kw}"` };
    }

    return { found: true, product };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: CATEGORIES
  // ─────────────────────────────────────────────────────────────────────────

  async getCategories(): Promise<{ count: number; categories: any[] }> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { count: categories.length, categories };
  }

  // Lấy cả subcategory (dùng khi cần match category_name chính xác)
  async getAllCategories(): Promise<{ count: number; categories: any[] }> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        parent: { select: { name: true } },
      },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
    });
    return { count: categories.length, categories };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: BRANDS
  // ─────────────────────────────────────────────────────────────────────────

  async getBrands(): Promise<{ count: number; brands: any[] }> {
    const brands = await this.prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
    return { count: brands.length, brands };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: ORDERS (yêu cầu userId — đã đăng nhập)
  // ─────────────────────────────────────────────────────────────────────────

  async getMyOrders(
    userId: string,
    limit = 5,
  ): Promise<{ count: number; orders: any[] }> {
    if (!userId) return { count: 0, orders: [] };

    const orders = await this.prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        finalAmount: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            productNameAtTime: true,
            productImageAtTime: true,
            price: true,
            salePrice: true,
          },
        },
      },
      take: Math.min(limit, MAX_LIMIT),
      orderBy: { createdAt: 'desc' },
    });

    return { count: orders.length, orders };
  }

  async getOrderDetail(
    orderId: string,
    userId: string,
  ): Promise<{ found: boolean; order?: any; message?: string }> {
    if (!orderId?.trim()) {
      return { found: false, message: 'Cần mã đơn hàng' };
    }
    if (!userId) {
      return { found: false, message: 'Cần đăng nhập để tra cứu đơn hàng' };
    }

    const order = await this.prisma.order.findFirst({
      where: { id: orderId.trim(), userId },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        shippingFee: true,
        discountAmount: true,
        finalAmount: true,
        paymentStatus: true,
        paymentMethod: true,
        receiverName: true,
        receiverPhone: true,
        shippingAddress: true,
        ward: true,
        city: true,
        note: true,
        cancelReason: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            salePrice: true,
            productNameAtTime: true,
            productImageAtTime: true,
          },
        },
      },
    });

    if (!order) {
      return {
        found: false,
        message: `Không tìm thấy đơn hàng "${orderId}" thuộc tài khoản này`,
      };
    }

    return { found: true, order };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: TOP PRODUCTS
  // ─────────────────────────────────────────────────────────────────────────

  async getTopExpensiveProducts(
    limit = 5,
  ): Promise<{ count: number; products: any[] }> {
    const safeLimit = Math.min(limit, MAX_LIMIT);
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: this.productListSelect,
      take: safeLimit,
      orderBy: { price: 'desc' },
    });
    return { count: products.length, products };
  }

  async getTopCheapProducts(
    limit = 5,
  ): Promise<{ count: number; products: any[] }> {
    const safeLimit = Math.min(limit, MAX_LIMIT);
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: this.productListSelect,
      take: safeLimit,
      orderBy: { price: 'asc' },
    });
    return { count: products.length, products };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: STORE STATISTICS
  // ─────────────────────────────────────────────────────────────────────────

  async getStoreStatistics(): Promise<any> {
    const [
      totalProducts,
      avgPriceResult,
      minPriceResult,
      maxPriceResult,
      brandCount,
      categoryCount,
    ] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.aggregate({
        where: { isActive: true },
        _avg: { price: true },
      }),
      this.prisma.product.aggregate({
        where: { isActive: true },
        _min: { price: true },
      }),
      this.prisma.product.aggregate({
        where: { isActive: true },
        _max: { price: true },
      }),
      this.prisma.brand.count({ where: { isActive: true } }),
      this.prisma.category.count({ where: { isActive: true } }),
    ]);

    return {
      totalProducts,
      averagePrice: avgPriceResult._avg.price ?? 0,
      minPrice: minPriceResult._min.price ?? 0,
      maxPrice: maxPriceResult._max.price ?? 0,
      totalBrands: brandCount,
      totalCategories: categoryCount,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: COUNT (dùng để test + STORE_INFO)
  // ─────────────────────────────────────────────────────────────────────────

  async countProducts(): Promise<{ total_products: number }> {
    const total = await this.prisma.product.count({
      where: { isActive: true },
    });
    return { total_products: total };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: SEARCH BY CATEGORY SLUG
  // ─────────────────────────────────────────────────────────────────────────

  async searchByCategory(
    categorySlugOrName: string,
    limit = 5,
    sort_by?: SearchConstraints['sort_by'],
  ): Promise<{ count: number; products: any[] }> {
    return this.executeUnifiedSearch({
      category_name: categorySlugOrName,
      limit,
      sort_by,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEV ONLY: devTest — gọi từng hàm qua endpoint POST /chat/dev/mcp-test
  // XÓA TRƯỚC KHI DEPLOY PRODUCTION
  // ─────────────────────────────────────────────────────────────────────────

  async devTest(fn: string, args: any = {}): Promise<any> {
    switch (fn) {
      case 'countProducts':
        return this.countProducts();
      case 'getCategories':
        return this.getCategories();
      case 'getAllCategories':
        return this.getAllCategories();
      case 'getBrands':
        return this.getBrands();
      case 'getProductDetail':
        return this.getProductDetail(args.keyword ?? '');
      case 'search':
        return this.executeUnifiedSearch(args);
      case 'getTopExpensiveProducts':
        return this.getTopExpensiveProducts(args.limit ?? 5);
      case 'getTopCheapProducts':
        return this.getTopCheapProducts(args.limit ?? 5);
      case 'getStoreStatistics':
        return this.getStoreStatistics();
      case 'getMyOrders':
        return this.getMyOrders(args.userId ?? '', args.limit ?? 5);
      case 'getOrderDetail':
        return this.getOrderDetail(args.orderId ?? '', args.userId ?? '');
      default:
        return { error: `Unknown fn: ${fn}` };
    }
  }
}
