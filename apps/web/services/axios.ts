import axios from "axios";
import axiosRetry from "axios-retry";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => {
    console.log(`Retry lần ${retryCount} sau ${retryCount * 3000}ms`);
    return retryCount * 3000;
  },
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkError(error) ||
      error.code === "ECONNABORTED" ||
      error.response?.status === 500 ||
      error.response?.status === 502 ||
      error.response?.status === 503
    );
  },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const ERROR_MESSAGES: Record<number, string> = {
  400: "Dữ liệu không hợp lệ",
  403: "Bạn không có quyền thực hiện thao tác này",
  404: "Không tìm thấy dữ liệu",
  408: "Yêu cầu quá thời gian chờ",
  413: "File quá lớn",
  422: "Dữ liệu không thể xử lý",
  429: "Quá nhiều yêu cầu, vui lòng thử lại sau",
  500: "Lỗi máy chủ, vui lòng thử lại sau",
  502: "Máy chủ không phản hồi",
  503: "Dịch vụ tạm thời không khả dụng",
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data.data.accessToken;
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:unauthorized"));
        }

        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        return Promise.reject(refreshError);
      }
    }

    // không hiện toast khi đang retry
    const isRetrying = (error.config?.["axios-retry"]?.retryCount ?? 0) > 0;

    if (!isRetrying && error.response?.status !== 401) {
      const status = error.response?.status;
      const beMessage = error.response?.data?.message;

      const message =
        typeof beMessage === "string" && beMessage.trim()
          ? beMessage
          : (ERROR_MESSAGES[status] ?? "Đã có lỗi xảy ra, vui lòng thử lại");

      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
