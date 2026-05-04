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
    console.log("🚀 Calling:", api.defaults.baseURL + "/categories");

    const res = await api.get("/categories");

    console.log("✅ STATUS:", res.status);
    console.log("✅ DATA:", res.data);
    console.log("✅ HEADERS:", res.headers);

    return res.data?.data || res.data || [];
  } catch (error: any) {
    console.error("❌ FULL ERROR:", error);

    console.error("❌ MESSAGE:", error?.message);
    console.error("❌ CODE:", error?.code);
    console.error("❌ RESPONSE:", error?.response);
    console.error("❌ REQUEST:", error?.request);

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

export const uploadCategoryImage = async (categoryId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/categories/${categoryId}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
