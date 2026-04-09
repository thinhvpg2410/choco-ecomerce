"use client";
import { useEffect } from "react";
import api, { setAccessToken } from "@/services/axios";
import { useDispatch } from "react-redux";
import { login, logout, setLoading} from "@/store/authSlice";
export  function AuthProvider({ children }: any) {
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.post("/auth/refresh");

        const { accessToken, user } = res.data.data;

        setAccessToken(accessToken);
        dispatch(login(user));
      } catch {
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    init();
  }, []);

  return children;
}
