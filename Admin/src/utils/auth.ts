import { jwtDecode } from "jwt-decode";
import { DecodedToken, UserRole } from "@/types";

// ── Cookie keys (read by both middleware & client) ────────────────────────────
export const TOKEN_COOKIE = "issop_token";
export const ROLE_COOKIE  = "issop_role";

// ── Cookie helpers (client-side only) ────────────────────────────────────────
export function setAuthCookies(token: string, role: UserRole) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
}

// ── Token helpers ─────────────────────────────────────────────────────────────
export function decodeToken(token: string): DecodedToken | null {
  try { return jwtDecode<DecodedToken>(token); }
  catch { return null; }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}

export function getRoleFromToken(token: string): UserRole | null {
  return decodeToken(token)?.role ?? null;
}

// ── Role routing maps ─────────────────────────────────────────────────────────
export const PROTECTED_ROUTES       = ["/dashboard", "/requests", "/tasks", "/users", "/analytics", "/settings"];
export const PUBLIC_ROUTES          = ["/login"];
// Updated to match Backend Prisma enum uppercase
export const SUPERADMIN_ONLY_ROUTES = ["/users", "/analytics", "/settings"];
