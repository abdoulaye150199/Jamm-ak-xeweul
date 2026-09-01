import { NextResponse } from 'next/server';
import { MEMBER_SESSION_COOKIE } from '@/lib/member-auth';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';

export async function POST(request: Request) {
  if (isBackendConfigured()) return proxyToBackend(request, '/auth/logout');
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MEMBER_SESSION_COOKIE, '', {
    expires: new Date(0),
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
