import api from "./apiClient";
import { DashboardStats } from "@/types";

export const analyticsService = {
  getDashboardStats: async (from?: string, to?: string): Promise<DashboardStats> => {
    const { data } = await api.get("/analytics/dashboard", { params: { from, to } });
    return data;
  },

  exportReport: async (format: "csv" | "pdf", filters?: Record<string, string>): Promise<Blob> => {
    const { data } = await api.get(`/analytics/export/${format}`, {
      params: filters,
      responseType: "blob",
    });
    return data;
  },
};
