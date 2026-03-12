import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/student', '/teacher', '/admin', '/learn', '/checkout'];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const hasSession = request.cookies.has('refresh_token');

  if (isProtected && !hasSession)
    return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*', '/teacher/:path*', '/admin/:path*',
    '/learn/:path*', '/checkout/:path*',
    '/login', '/register', '/forgot-password', '/reset-password',
  ],
};
