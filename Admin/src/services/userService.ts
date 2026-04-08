import api from "./apiClient";
import { PaginatedResponse, User, UserRole, UserStatus } from "@/types";

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export const userService = {
  getAll: async (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get("/users", { params: filters });
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (payload: Partial<User> & { password: string }): Promise<User> => {
    const { data } = await api.post("/users", payload);
    return data;
  },

  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data;
  },

  updateStatus: async (id: string, status: UserStatus): Promise<User> => {
    const { data } = await api.patch(`/users/${id}/status`, { status });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
