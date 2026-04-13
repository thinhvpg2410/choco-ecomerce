"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, logout, setLoading } from "@/store/authSlice";
import api, { setAccessToken } from "@/services/axios";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreAuth = async () => {
      dispatch(setLoading(true));

      try {
        // Gửi request để lấy token mới từ cookie
        const res = await api.post("/auth/refresh");

        const { accessToken, user } = res.data.data;

        setAccessToken(accessToken);
        dispatch(login(user));

        console.log("✅ [Auth] Tự động đăng nhập thành công");
      } catch (err: any) {
        const status = err?.response?.status;

        // Phân loại lỗi để tránh báo đỏ vô lý
        if (status === 401) {
          // 401 là bình thường: Người dùng chưa đăng nhập hoặc cookie hết hạn
          console.log("ℹ️ [Auth] Chưa có phiên đăng nhập (Khách)");
        } else {
          // Các lỗi khác (500, Network Error) thì mới cần log error
          console.error(
            "❌ [Auth] Lỗi kết nối hệ thống xác thực:",
            err.message,
          );
        }

        setAccessToken(null);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    restoreAuth();
  }, [dispatch]);

  return <>{children}</>;
}
