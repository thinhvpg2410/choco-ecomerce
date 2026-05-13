import api from "@/services/axios";
import type { Product } from "@/types/type";

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  image_url?: string;
  is_active: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  category?: { id: string; name: string };
  created_at: string;
}

export interface AdminProductResponse {
  products: AdminProduct[];
  total: number;
  page: number;
  limit: number;
}

export async function getAdminProducts(params: {
  page?: number;
  search?: string;
  category_id?: string;
  brand_id?: string;
}) {
  const res = await api.get("/products", {
    params: {
      page: params.page || 1,
      limit: 10, // hoặc 12 cho UI đẹp
      search: params.search,
      category_id: params.category_id,
      brand_id: params.brand_id,
    },
  });

  const data = res.data?.data;

  return {
    products: data?.items ?? [],
    pagination: {
      page: data?.pagination?.page ?? 1,
      limit: data?.pagination?.limit ?? 10,
      total: data?.pagination?.total ?? 0,
      totalPages: data?.pagination?.totalPages ?? 1,
    },
  };
}

// ================= CRUD =================

export async function createProduct(data: any) {
  const res = await api.post("/products", data);
  return res.data.data ?? res.data;
}

export async function updateProduct(id: string, data: any) {
  const res = await api.put(`/products/${id}`, data);
  return res.data.data ?? res.data;
}

export async function uploadProductImage(
  productId: string,
  formData: FormData,
) {
  const res = await api.post(`/products/${productId}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data ?? res.data;
}

export async function deleteProduct(id: string) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}
