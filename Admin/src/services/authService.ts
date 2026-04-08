import api from "./apiClient";
import { AuthTokens, LoginPayload, User } from "@/types";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthTokens & { user: User }> => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  me: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await api.post("/auth/refresh", { refreshToken });
    return data;
  },
};
