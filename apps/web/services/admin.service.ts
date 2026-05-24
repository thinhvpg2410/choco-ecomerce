import api from "@/services/axios";
import type { User, Order, Product, Coupon } from "@/types/type";

//USERS
export const getAdminUsers = async (params: {
  page?: number;
  search?: string;
}): Promise<any> => {
  try {
    const res = await api.get("/admin/users", { params });
    console.log("Tải danh sách người dùng thành công:", res.data);
    return res.data.data || res.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi lấy danh sách người dùng:",
      error?.response?.data || error,
    );
    throw error;
  }
};

export const toggleUserStatus = async (
  userId: string,
  status: "active" | "inactive",
) => {
  try {
    const res = await api.patch(`/admin/users/${userId}/status`, { status });
    console.log("Cập nhật trạng thái người dùng thành công:", res.data);
    return res.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi cập nhật trạng thái người dùng:",
      error?.response?.data || error,
    );
    throw error;
  }
};

//PRODUCTS
export const getAdminProducts = async (params: {
  page?: number;
  search?: string;
  category_id?: string;
  brand_id?: string;
}) => {
  try {
    const res = await api.get("/admin/products", { params });
    console.log("Tải danh sách sản phẩm thành công:", res.data);
    return res.data.data || res.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi lấy danh sách sản phẩm:",
      error?.response?.data || error,
    );
    throw error;
  }
};

//ORDERS
export const getAdminOrders = async (params: {
  page?: number;
  search?: string;
  status?: string;
}) => {
  try {
    const res = await api.get("/admin/orders", { params });
    console.log("Tải danh sách đơn hàng thành công:", res.data);
    return res.data.data || res.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi lấy danh sách đơn hàng:",
      error?.response?.data || error,
    );
    throw error;
  }
};

//STATISTICS
export const getAdminStatistics = async (year?: number) => {
  try {
    const res = await api.get("/admin/statistics", {
      params: { year },
    });
    console.log("Tải thống kê thành công:", res.data);
    return res.data.data || res.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy thống kê:", error?.response?.data || error);
    throw error;
  }
};

//COUPONS
export const getAdminCoupons = async (params: any) => {
  try {
    const res = await api.get("/admin/coupons", { params });
    console.log("Tải danh sách mã giảm giá thành công:", res.data);
    return res.data.data?.coupons ?? res.data.data ?? [];
  } catch (error: any) {
    console.error(
      "Lỗi khi lấy danh sách mã giảm giá:",
      error?.response?.data || error,
    );
    throw error;
  }
};

// Coupon
export const createCoupon = async (payload: any) => {
  try {
    const res = await api.post("/coupons", payload);

    return res.data.data || res.data;
  } catch (error: any) {
    console.error("Lỗi khi tạo mã giảm giá:", error?.response?.data || error);
    throw error;
  }
};

export const updateCoupon = async (couponId: string, payload: any) => {
  try {
    const res = await api.put(`/coupons/${couponId}`, payload);

    return res.data.data || res.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi cập nhật mã giảm giá:",
      error?.response?.data || error,
    );
    throw error;
  }
};

export const deleteCoupon = async (couponId: string) => {
  try {
    const res = await api.delete(`/coupons/${couponId}`);

    return res.data;
  } catch (error: any) {
    console.error("Lỗi khi xóa mã giảm giá:", error?.response?.data || error);
    throw error;
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const res = await api.get(`/admin/orders/${orderId}`);
    return res.data.data || res.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi lấy chi tiết đơn hàng:",
      error?.response?.data || error,
    );
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi cập nhật trạng thái đơn hàng:",
      error?.response?.data || error,
    );
    throw error;
  }
};

export const updateOrderPaymentStatus = async (
  orderId: string,
  paymentStatus: string,
) => {
  try {
    const res = await api.patch(`/admin/orders/${orderId}/payment-status`, {
      paymentStatus,
    });

    return res.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi cập nhật trạng thái thanh toán:",
      error?.response?.data || error,
    );
    throw error;
  }
};
