import axios from "axios";
import axiosRetry from "axios-retry";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

//retry chức năng quét QR thanh toán bằng cách gọi lại API khi có lỗi mạng hoặc lỗi server tạm thời

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

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
