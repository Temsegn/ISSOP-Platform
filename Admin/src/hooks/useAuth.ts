"use client";
import { useMutation, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { LoginPayload } from "@/types";
import { useRouter as useNavRouter } from "next/navigation";

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth, isTokenValid } = useAuthStore();
  const router = useNavRouter();

  const login = async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    setAuth(result.accessToken, result.user);
    router.push("/dashboard");
    return result;
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    router.push("/login");
  };

  return { user, token, isAuthenticated, isTokenValid, login, logout };
}
