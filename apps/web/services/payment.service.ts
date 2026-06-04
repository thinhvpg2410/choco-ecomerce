import api from "@/services/axios";
import type { PaymentMethod } from "@/types/type";

export interface CreatePaymentDto {
  order_id: string;
  payment_method: PaymentMethod;
  transaction_code?: string;
}

export interface PaymentResponse {
  id: string;
  order_id: string;
  payment_method: string;
  payment_status: "PENDING" | "PAID";
  amount: number;
  transaction_code?: string;
  qr_url?: string; 
  qrUrl?: string; 
  paid_at?: string;
  created_at: string;
}

export const createPayment = async (
  dto: CreatePaymentDto,
): Promise<PaymentResponse> => {
  try {
    const res = await api.post("/payments", dto);
    return res.data.data;
  } catch (error: any) {
    console.error("Create payment error:", error?.response?.data || error);
    throw error;
  }
};

export const getPaymentByOrderId = async (
  orderId: string,
): Promise<PaymentResponse | null> => {
  try {
    const res = await api.get(`/payments/${orderId}`);
    return res.data?.data || null;
  } catch (error: any) {
    console.error("Get payment error:", error?.response?.data || error);
    return null;
  }
};
