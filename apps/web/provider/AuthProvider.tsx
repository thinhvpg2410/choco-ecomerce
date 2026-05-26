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
      console.log("🔄 [Auth] Bắt đầu restore session...");

      try {
        const res = await api.post("/auth/refresh");
        const { accessToken, user } = res.data.data;
        setAccessToken(accessToken);
        dispatch(login(user));
        console.log("✅ [Auth] Restore thành công, user:", user);
        console.log("✅ [Auth] Role:", user?.role);
      } catch (err: any) {
        const status = err?.response?.status;
        console.log("❌ [Auth] Refresh fail, status:", status);
        console.log("❌ [Auth] Error:", err?.response?.data);
        setAccessToken(null);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
        console.log("🏁 [Auth] setLoading(false) xong");
      }
    };

    restoreAuth();
  }, [dispatch]);

  return <>{children}</>;
}
