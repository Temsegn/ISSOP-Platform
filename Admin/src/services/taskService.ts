import api from "./apiClient";
import { PaginatedResponse, Task, TaskStatus } from "@/types";

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  agentId?: string;
  requestId?: string;
}

export const taskService = {
  getAll: async (filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> => {
    const { data } = await api.get("/tasks", { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },

  create: async (payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.post("/tasks", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    return data;
  },

  updateStatus: async (id: string, status: TaskStatus, notes?: string): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}/status`, { status, notes });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
