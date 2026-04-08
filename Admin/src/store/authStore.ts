"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { config } from "@/config/env";
import { DecodedToken, User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isTokenValid: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        localStorage.setItem(config.tokenKey, token);
        set({ token, user, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem(config.tokenKey);
        localStorage.removeItem(config.refreshTokenKey);
        set({ token: null, user: null, isAuthenticated: false });
      },

      isTokenValid: () => {
        const { token } = get();
        if (!token) return false;
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          return decoded.exp * 1000 > Date.now();
        } catch {
          return false;
        }
      },
    }),
    {
      name: "issop-auth",
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
