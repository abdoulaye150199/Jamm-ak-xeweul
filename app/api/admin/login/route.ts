import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getAdminSessionToken, isAdminCredentials } from '@/lib/admin-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const limit = checkRateLimit(`admin:${ip}`);
    if (!limit.allowed) return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
    if (isBackendConfigured()) return proxyToBackend(request, '/auth/admin/login', body);
    const { email, password } = body;
    if (typeof email !== 'string' || typeof password !== 'string' || !isAdminCredentials(email, password)) {
      return NextResponse.json({ error: 'Adresse e-mail ou mot de passe incorrect.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, getAdminSessionToken(), {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Impossible de traiter la connexion.' }, { status: 400 });
  }
}
