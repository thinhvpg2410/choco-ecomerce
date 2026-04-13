import api from "@/services/axios";
import type { Product } from "@/types/type";

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export async function getProducts(params: {
  page?: number;
  search?: string;
  min_price?: string;
  max_price?: string;
  brand_id?: string;
  category_id?: string;
  is_new?: boolean;
  is_best_seller?: boolean;
}): Promise<ProductResponse> {
  try {
    const query: Record<string, unknown> = {
      page: params.page || 1,
      limit: 12, // number, không phải string
      search: params.search,
      min_price: params.min_price,
      max_price: params.max_price,
      brand_id: params.brand_id,
      category_id: params.category_id,
    };

    if (params.is_new) query.is_new = true;
    if (params.is_best_seller) query.is_best_seller = true;

    const res = await api.get("/products", {
      params: query,
      headers: {
        "Cache-Control": "no-cache", // ← quan trọng: bỏ qua cache HTTP
        Pragma: "no-cache",
      },
    });

    const data = res.data;
    const pagination = data?.data?.pagination;

    return {
      products: data?.data?.items ?? [],
      total: Number(pagination?.total ?? 0),
      page: Number(params.page ?? 1),
      limit: Number(pagination?.limit ?? 12),
    };
  } catch (error: any) {
    console.error("❌ Get products error:", error?.response?.data || error);
    return { products: [], total: 0, page: 1, limit: 12 };
  }
}
