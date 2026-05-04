import api from "@/services/axios";

export const bannerService = {
  async uploadImage(bannerId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/banners/${bannerId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getBanners() {
    const response = await api.get('/banners');
    return response.data;
  },
};