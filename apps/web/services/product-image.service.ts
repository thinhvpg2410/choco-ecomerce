import axios from '@/services/axios';

export const productImageService = {
  async uploadImage(file: File, productId: string, sortOrder?: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);
    if (sortOrder !== undefined) {
      formData.append('sortOrder', sortOrder.toString());
    }

    const response = await axios.post('/product-images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getProductImages(productId?: string) {
    const params = productId ? { product_id: productId } : {};
    const response = await axios.get('/product-images', { params });
    return response.data;
  },

  async deleteProductImage(id: string) {
    const response = await axios.delete(`/product-images/${id}`);
    return response.data;
  },
};