// src/services/brand.service.ts
import api from "@/services/axios";

export interface Brand {
  id: number | string;
  name: string;
  image?: string;
  slug?: string;
  description?: string;
}

export const getBrands = async (): Promise<Brand[]> => {
  try {
    const res = await api.get("/brands");
    // Điều chỉnh theo cấu trúc response thực tế của bạn
    return res.data?.data || res.data || [];
  } catch (error: any) {
    console.error("❌ Get brands error:", error?.response?.data || error);
    return [];
  }
};

// Nếu sau này cần lấy brand theo ID
export const getBrandById = async (
  id: string | number,
): Promise<Brand | null> => {
  try {
    const res = await api.get(`/brands/${id}`);
    return res.data?.data || null;
  } catch (error) {
    console.error("❌ Get brand by id error:", error);
    return null;
  }
};
