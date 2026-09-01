import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'jamm_admin_session';

export function middleware(request: NextRequest) {
  const sessionCookie = process.env.BACKEND_ADMIN_SESSION_COOKIE ?? ADMIN_SESSION_COOKIE;
  const hasSessionCookie = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value || request.cookies.get(sessionCookie)?.value);
  if (hasSessionCookie) return NextResponse.next();

  const loginUrl = new URL('/login/admin', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
