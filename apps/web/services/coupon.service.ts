// src/services/coupon.service.ts

import api from "@/services/axios";
export interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ApplyCouponPayload {
  code: string;
  subtotal: number;

  order_id?: string;
}

export interface ApplyCouponResponse {
  code: string;
  discount_amount: number;
  subtotal: number;
  final_amount: number;
}


export const getCoupons = async (): Promise<Coupon[]> => {
  try {
    const res = await api.get("/coupons");

    return res.data?.data || [];
  } catch (error: any) {
    console.error("Get coupons error:", error?.response?.data || error);

    return [];
  }
};

export const applyCoupon = async (
  payload: ApplyCouponPayload,
): Promise<ApplyCouponResponse | null> => {
  try {
    const res = await api.post("/coupons/apply", {
      code: payload.code,
      subtotal: payload.subtotal,
      order_id: payload.order_id,
    });

    return res.data?.data || null;
  } catch (error: any) {
    console.error("Apply coupon error:", error?.response?.data || error);

    throw error;
  }
};


//(ADMIN)
export interface CreateCouponDto {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;

  max_discount?: number;
  min_order_amount?: number;
  usage_limit?: number;

  expires_at?: string;

  is_active?: boolean;
}

export const createCoupon = async (
  dto: CreateCouponDto,
): Promise<Coupon | null> => {
  try {
    const res = await api.post("/coupons", dto);

    return res.data?.data || null;
  } catch (error: any) {
    console.error("❌ Create coupon error:", error?.response?.data || error);

    throw error;
  }
};


export interface UpdateCouponDto {
  code?: string;
  type?: "PERCENT" | "FIXED";
  value?: number;

  max_discount?: number;
  min_order_amount?: number;
  usage_limit?: number;

  expires_at?: string | null;

  is_active?: boolean;
}

export const updateCoupon = async (
  id: string,
  dto: UpdateCouponDto,
): Promise<Coupon | null> => {
  try {
    const res = await api.put(`/coupons/${id}`, dto);

    return res.data?.data || null;
  } catch (error: any) {
    console.error("❌ Update coupon error:", error?.response?.data || error);

    throw error;
  }
};

export const deleteCoupon = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/coupons/${id}`);

    return true;
  } catch (error: any) {
    console.error("❌ Delete coupon error:", error?.response?.data || error);

    throw error;
  }
};
