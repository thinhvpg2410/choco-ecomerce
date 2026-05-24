// src/services/banner.service.ts
import api from "@/services/axios";

export interface Banner {
  id: string;
  description?: string;
  image_url: string;
  link?: string;
  product_id?: string | null;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

export const bannerService = {
  async getBanners() {
    const response = await api.get("/banners");
    return response.data as Banner[];
  },

  async getActiveBanners() {
    const response = await api.get("/banners/active");
    return response.data as Banner[];
  },

  async uploadImage(bannerId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/banners/${bannerId}/upload-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
};
