import type { Product } from "@/types/type";
import api from "@/services/axios";

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export async function getProducts(params: any): Promise<ProductResponse> {
  try {
    const query: any = {
      page: params.page || 1,
      limit: "12",
      search: params.search,
      min_price: params.min_price,
      max_price: params.max_price,
    };

    // ✅ CHỈ gửi khi TRUE
    if (params.is_new) {
      query.is_new = true;
    }

    if (params.is_best_seller) {
      query.is_best_seller = true;
    }

    const res = await api.get("/products", { params: query });

    const data = res.data;
    const pagination = data?.data?.pagination;

    return {
      products: data?.data?.items || [],
      total: Number(pagination?.total ?? 0),
      page: Number(params.page || 1),
      limit: Number(pagination?.limit ?? 12),
    };
  } catch (error: any) {
    console.error("❌ Get products error:", error?.response?.data || error);
    return {
      products: [],
      total: 0,
      page: 1,
      limit: 12,
    };
  }
}
