import api from "@/services/axios";
import type { Order, OrderStatus, PaymentStatus } from "@/types/type";

export interface CreateOrderDto {
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  payment_method: string;
  note?: string;
  cart_item_ids?: string[];
}

export interface OrderApiItem {
  order_item_id: string;
  product_id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface OrderApiResponse {
  id: string;
  user_id: string;
  items: OrderApiItem[];
  total_amount: number;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  payment_method: string;
  createdAt: string;
}

export const createOrder = async (
  dto: CreateOrderDto,
): Promise<OrderApiResponse> => {
  try {
    const res = await api.post("/orders", dto);
    return res.data.data;
  } catch (error: any) {
    console.error("❌ Create order error:", error?.response?.data || error);
    throw error;
  }
};

export const getMyOrders = async (): Promise<OrderApiResponse[]> => {
  try {
    const res = await api.get("/orders/my");
    return res.data?.data || [];
  } catch (error: any) {
    console.error("❌ Get my orders error:", error?.response?.data || error);
    return [];
  }
};

export const getOrderById = async (
  id: string,
): Promise<OrderApiResponse | null> => {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data?.data || null;
  } catch (error: any) {
    console.error("❌ Get order by id error:", error?.response?.data || error);
    return null;
  }
};
