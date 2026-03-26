import axios from "axios";
import Cookies from "js-cookie";

export const apiClient = axios.create({
  baseURL: "http://localhost:3001",
});

// ၁။ Request Interceptor
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ၂။ Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Access Token Expire ဖြစ်မဖြစ် စစ်ဆေးခြင်း
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("⚠️ [Auth]: Access Token Expired. Attempting to refresh...");

      originalRequest._retry = true;
      const refreshToken = Cookies.get("refresh_token");

      if (!refreshToken) {
        console.error(
          "❌ [Auth]: No Refresh Token found. Redirecting to login...",
        );
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // Refresh API ခေါ်ခြင်း
        const res = await axios.post(
          "http://localhost:3001/credentials/refresh",
          {
            refresh_token: refreshToken,
          },
        );

        const { access_token, refresh_token } = res.data.data;

        // Token အသစ်များကို သိမ်းဆည်းခြင်း
        Cookies.set("access_token", access_token, {
          expires: 4 / 24,
          secure: true,
        });
        Cookies.set("refresh_token", refresh_token, {
          expires: 7,
          secure: true,
        });

        console.log("✅ [Auth]: New Access Token obtained successfully.");

        // အရေးကြီးဆုံးအချက်: ဒုတိယအကြိမ် Request အတွက် Header ကို အသစ်လဲပေးခြင်း
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${access_token}`;

        // မူလ Request ကို ပြန်လည်ပို့ဆောင်ခြင်း
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        // Refresh Token ပါ သက်တမ်းကုန်သွားခြင်း
        console.error(
          "🚫 [Auth]: Refresh Token Expired or Invalid. User must login again.",
        );
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

const handleLogout = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};
