import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { config } from "@/config/env";

const api: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach token ─────────────────────────────────────────
api.interceptors.request.use((req: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(config.tokenKey);
    if (token && req.headers) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }
  return req;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(config.tokenKey);
      localStorage.removeItem(config.refreshTokenKey);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
