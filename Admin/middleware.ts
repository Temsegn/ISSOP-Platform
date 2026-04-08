import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE, ROLE_COOKIE, PROTECTED_ROUTES, PUBLIC_ROUTES, SUPERADMIN_ONLY_ROUTES } from "@/utils/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token    = req.cookies.get(TOKEN_COOKIE)?.value;
  const role     = req.cookies.get(ROLE_COOKIE)?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isPublic    = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isRoot      = pathname === "/";

  // ── 1. Root redirect ──────────────────────────────────────────────────────
  if (isRoot) {
    return token
      ? NextResponse.redirect(new URL("/dashboard", req.url))
      : NextResponse.redirect(new URL("/login", req.url));
  }

  // ── 2. Unauthenticated → send to login ────────────────────────────────────
  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── 3. Authenticated user hitting public page → redirect to dashboard ─────
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ── 4. SuperAdmin-only route guard ────────────────────────────────────────
  if (SUPERADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "superadmin" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/requests/:path*",
    "/tasks/:path*",
    "/users/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
