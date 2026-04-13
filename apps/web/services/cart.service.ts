// src/services/cart.service.ts
import api from "@/services/axios";

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    image_url: string;
    price: number;
    sale_price: number | null;
    slug: string;
  };
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface AddToCartDto {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export interface UpdateCartDto {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

// Lấy giỏ hàng hiện tại
export const getCart = async (): Promise<Cart | null> => {
  try {
    const res = await api.get("/cart");
    return res.data?.data || null;
  } catch (error: any) {
    console.error("❌ Get cart error:", error?.response?.data || error);
    return null;
  }
};

// Thêm sản phẩm vào giỏ
export const addToCart = async (dto: AddToCartDto): Promise<Cart | null> => {
  try {
    const res = await api.post("/cart/add", dto);
    return res.data?.data || null;
  } catch (error: any) {
    console.error("❌ Add to cart error:", error?.response?.data || error);
    throw error; // throw để component bắt và hiện toast lỗi
  }
};

// Cập nhật số lượng
export const updateCartItem = async (
  dto: UpdateCartDto,
): Promise<Cart | null> => {
  try {
    const res = await api.put("/cart/update", dto);
    return res.data?.data || null;
  } catch (error: any) {
    console.error("❌ Update cart error:", error?.response?.data || error);
    throw error;
  }
};

// Xóa 1 sản phẩm khỏi giỏ
export const removeFromCart = async (
  productId: string,
): Promise<Cart | null> => {
  try {
    const res = await api.delete(`/cart/remove/${productId}`);
    return res.data?.data || null;
  } catch (error: any) {
    console.error("❌ Remove from cart error:", error?.response?.data || error);
    throw error;
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (): Promise<boolean> => {
  try {
    await api.delete("/cart/clear");
    return true;
  } catch (error: any) {
    console.error("❌ Clear cart error:", error?.response?.data || error);
    throw error;
  }
};
