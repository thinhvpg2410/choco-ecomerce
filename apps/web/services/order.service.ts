import api from "@/services/axios";
import type { Order, OrderStatus } from "@/types/type";

export interface CreateOrderDto {
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  payment_method: string;
  note?: string;
}

export interface OrderApiItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderApiResponse {
  id: string;
  user_id: string;
  items: OrderApiItem[];
  total_amount: number;
  status: OrderStatus;
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
