import api, { setAccessToken } from "@/services/axios";
import type { User } from "@/types/type";

export interface LoginDto {
  email: string;
  password: string;
  guestCart?: any[];
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  cart?: any;
}

export const authLogin = async (dto: LoginDto): Promise<AuthResponse> => {
  try {
    const res = await api.post("/auth/login", dto, { withCredentials: true });
    return res.data.data;
  } catch (error: any) {
    console.error("Lỗi đăng nhập:", error?.response?.data || error);
    throw error;
  }
};

export const authRegister = async (dto: RegisterDto): Promise<AuthResponse> => {
  try {
    const res = await api.post("/auth/register", dto);
    return res.data.data;
  } catch (error: any) {
    console.error("Lỗi đăng ký:", error?.response?.data || error);
    throw error;
  }
};

export const authLogout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error: any) {
    console.error("Lỗi đăng xuất:", error?.response?.data || error);
  } finally {
    setAccessToken(null);
  }
};

export const authRefresh = async (): Promise<string | null> => {
  try {
    const res = await api.post("/auth/refresh", {}, { withCredentials: true });
    return res.data.data.accessToken ?? null;
  } catch (error: any) {
    console.error("Lỗi làm mới token:", error?.response?.data || error);
    return null;
  }
};
