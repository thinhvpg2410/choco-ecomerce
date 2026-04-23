import api from "./axios";

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
}

export const getUserById = async (id: string) => {
  try {
    const res = await api.get(`/users/${id}`);
    return res.data.data || res.data.user;
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error);
    return null;
  }
};