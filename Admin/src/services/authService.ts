import api from "./apiClient";
import { LoginPayload, User } from "@/types";

// The Backend returns: { status: "success", data: { user: User, token: string } }
interface BackendAuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  login: async (payload: LoginPayload): Promise<{ user: User; accessToken: string }> => {
    const response = await api.post<BackendAuthResponse>("/auth/login", payload);
    const { user, token } = response.data.data;
    // Map backend 'token' to frontend 'accessToken'
    return { user, accessToken: token };
  },

  logout: async (): Promise<void> => {
    // Basic logout — the backend might not even have this route yet
    try {
      await api.post("/auth/logout");
    } catch {
      // Slient fail
    }
  },

  me: async (): Promise<User> => {
    const response = await api.get<{ status: string; data: { user: User } }>("/auth/me");
    return response.data.data.user;
  },

  refreshToken: async (token: string): Promise<{ accessToken: string }> => {
    // Current backend doesn't seem to support refresh tokens based on prisma/service check
    // but we can mock it by returning the same token if needed, or just let it stay for now.
    const response = await api.post<{ status: string; data: { token: string } }>("/auth/refresh", { refreshToken: token });
    return { accessToken: response.data.data.token };
  },
};
