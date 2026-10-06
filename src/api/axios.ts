import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL
,
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Type": "mobile",
  },
});

api.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      config.headers.Cookie =
        `accessToken=${accessToken}; refreshToken=${refreshToken}`;
    } else {
      delete config.headers.Cookie;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;