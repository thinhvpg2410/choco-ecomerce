// src/services/category.service.ts
import api from "@/services/axios";

export interface Category {
  id: number | string;
  name: string;
  image?: string;
  slug?: string;
  description?: string;
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await api.get("/categories");
    return res.data?.data || res.data || [];
  } catch (error: any) {
    console.error("❌ Get categories error:", error?.response?.data || error);
    return [];
  }
};

// Nếu sau này cần lấy category theo ID
export const getCategoryById = async (
  id: string | number,
): Promise<Category | null> => {
  try {
    const res = await api.get(`/categories/${id}`);
    return res.data?.data || null;
  } catch (error) {
    console.error("❌ Get category by id error:", error);
    return null;
  }
};
