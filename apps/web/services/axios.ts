import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // 🔥 cho cookie
});

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

// 👉 attach token
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (
      err.response?.status === 401 &&
      !err.config._retry &&
      !err.config.url.includes("/auth/refresh")
    ) {
      try {
        if (err.config && !err.config._retry) {
          err.config._retry = true;
          const res = await axios.post(
            "http://localhost:5000/api/auth/refresh",
            null,
            { withCredentials: true },
          );

          const newAccess = res.data.data.accessToken;
          setAccessToken(newAccess);

          if (err.config.headers) {
            err.config.headers.Authorization = `Bearer ${newAccess}`;
          }
          return api(err.config);
        }
      } catch {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(err);
  },
);

export default api;
