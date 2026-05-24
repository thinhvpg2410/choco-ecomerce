// src/services/cart.service.ts
import api from "@/services/axios";
import {CartItem, Cart} from "@/types/type";

export interface AddToCartDto {
  product_id: string;
  quantity: number;
}

export interface UpdateCartDto {
  product_id: string;
  quantity: number;
}

export const getProductById = async (id: string) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data.data || res.data.product;
  } catch (error) {
    console.error("Lỗi lấy thông tin sản phẩm:", error);
    return null;
  }
};

// Lấy giỏ hàng hiện tại
export const getCart = async (): Promise<Cart | null> => {
  try {
    const res = await api.get("/cart");
    return res.data?.data || null;
  } catch (error: any) {
    console.error("❌ Get cart error full:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      stack: error?.stack
    });
    return null; 
  }
};

// Thêm sản phẩm vào giỏ
export const addToCart = async (dto: AddToCartDto): Promise<Cart | null> => {
  try {
    const res = await api.post("/cart/add", dto);

    const cart = res.data?.data;

    if (cart?.items) {
      localStorage.setItem(
        "checkout_cart",
        JSON.stringify({
          items: cart.items.map((i: any) => ({
            id: i.product_id,
            product_id: i.product_id,
            name: i.product_name,
            price: i.price,
            quantity: i.quantity,
            image: i.image || "",
          })),
          cart_item_ids: cart.items.map((i: any) => String(i.product_id)),
        }),
      );
    }

    return cart || null;
  } catch (error: any) {
    console.error("Add to cart error:", error?.response?.data || error);
    throw error;
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
    console.error("Update cart error:", error?.response?.data || error);
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
    console.error("Remove from cart error:", error?.response?.data || error);
    throw error;
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (): Promise<boolean> => {
  try {
    await api.delete("/cart/clear");
    return true;
  } catch (error: any) {
    console.error("Clear cart error:", error?.response?.data || error);
    throw error;
  }
};
