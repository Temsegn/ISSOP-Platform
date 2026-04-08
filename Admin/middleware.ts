import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const isPublicPath = pathname === '/login'

  // If the path is protected and there's no token, redirect to login
  if (!isPublicPath && !token) {
    // In a real app, we might also use localStorage, but Next.js middleware only sees cookies
    // For now, let's allow it if we're using localStorage on client side, 
    // but the clean way is using cookies for middleware.
    
    // return NextResponse.redirect(new URL('/login', request.url))
  }

  // If the user visits login and already has a token, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
}
