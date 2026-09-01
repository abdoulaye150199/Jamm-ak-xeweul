import { NextResponse } from 'next/server';
import { createMemberSessionToken, verifyMemberPassword } from '@/lib/member-auth';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';
import { checkRateLimit } from '@/lib/rate-limit';
import { getMemberByEmail } from '@/lib/site-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password) return NextResponse.json({ error: 'Veuillez renseigner votre e-mail et votre mot de passe.' }, { status: 400 });
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const limit = checkRateLimit(`member:${ip}:${email}`);
    if (!limit.allowed) return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
    if (isBackendConfigured()) return proxyToBackend(request, '/auth/login', body);

    const member = await getMemberByEmail(email);
    if (!member?.passwordHash || !verifyMemberPassword(password, member.passwordHash)) {
      return NextResponse.json({ error: 'Adresse e-mail ou mot de passe incorrect.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set('jamm_member_session', createMemberSessionToken(member.id), {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Impossible de traiter la connexion.' }, { status: 500 });
  }
}
