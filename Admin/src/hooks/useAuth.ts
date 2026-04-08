"use client";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { LoginPayload } from "@/types";
import { setAuthCookies, clearAuthCookies } from "@/utils/auth";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth, isTokenValid } = useAuthStore();
  const router = useRouter();

  const login = async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    // 1. Update Zustand store (localStorage persistence)
    setAuth(result.accessToken, result.user);
    // 2. Set Cookies (Middleware reads these for server-side guards)
    setAuthCookies(result.accessToken, result.user.role);
    // 3. Simple redirect
    router.push("/dashboard");
    return result;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Slient fail
    }
    clearAuth();
    clearAuthCookies();
    router.push("/login");
  };

  return { user, token, isAuthenticated, isTokenValid, login, logout };
}
