import axios from "axios";
import Cookies from "js-cookie";

export const apiClient = axios.create({
  baseURL: "http://localhost:3001",
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor ✅ FIXED
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // ✅ IMPORTANT (not data.data)
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          "http://localhost:3001/credentials/refresh",
          {
            refresh_token: refreshToken,
          }
        );

        const { access_token, refresh_token } = res.data.data;

        Cookies.set("access_token", access_token, { expires: 4 / 24 });
        Cookies.set("refresh_token", refresh_token, { expires: 7 });

        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (err) {
        handleLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

const handleLogout = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};