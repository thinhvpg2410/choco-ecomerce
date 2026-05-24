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
    console.log("brands raw:", res.data); 
    return res.data?.data || res.data || [];
  } catch (error: any) {
    console.error("❌ Get brands error:", error?.response?.data || error);
    return [];
  }
};

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

export const uploadBrandLogo = async (brandId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/brands/${brandId}/upload-logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
