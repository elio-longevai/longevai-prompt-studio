import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the authentication cookie
  const authCookie = request.cookies.get('longevai-auth');

  // Check if user is authenticated
  const isAuthenticated = authCookie?.value === process.env.AUTH_SECRET_TOKEN;

  // If not authenticated and not trying to access login or API login route, redirect to login
  if (!isAuthenticated && pathname !== '/login' && pathname !== '/api/login') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login page, redirect to home
  if (isAuthenticated && pathname === '/login') {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/login (login API route)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api/login|_next/static|_next/image|favicon.ico).*)',
  ],
};