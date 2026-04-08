import api from "./apiClient";
import { PaginatedResponse, ServiceRequest, RequestStatus, RequestPriority } from "@/types";

export interface RequestFilters {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  priority?: RequestPriority;
  category?: string;
  search?: string;
  region?: string;
  from?: string;
  to?: string;
}

export const requestService = {
  getAll: async (filters: RequestFilters = {}): Promise<PaginatedResponse<ServiceRequest>> => {
    const { data } = await api.get("/requests", { params: filters });
    return data;
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    const { data } = await api.get(`/requests/${id}`);
    return data;
  },

  updateStatus: async (id: string, status: RequestStatus, notes?: string): Promise<ServiceRequest> => {
    const { data } = await api.patch(`/requests/${id}/status`, { status, notes });
    return data;
  },

  assign: async (id: string, agentId: string): Promise<ServiceRequest> => {
    const { data } = await api.patch(`/requests/${id}/assign`, { agentId });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/requests/${id}`);
  },
};
