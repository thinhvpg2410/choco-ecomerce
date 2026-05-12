import api from "@/services/axios";

export const productImageService = {
  // Upload ảnh phụ
  async uploadImage(file: File, productId: string, sortOrder: number = 0) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);
    formData.append("sortOrder", sortOrder.toString());

    const res = await api.post("/product-images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Lấy danh sách ảnh phụ của sản phẩm
  async getProductImages(productId: string) {
    const res = await api.get(`/product-images?product_id=${productId}`);
    return res.data;
  },

  // Xóa ảnh phụ
  async deleteImage(id: string) {
    const res = await api.delete(`/product-images/${id}`);
    return res.data;
  },
};
