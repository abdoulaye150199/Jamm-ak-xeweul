import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getAdminSessionToken, isAdminCredentials } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
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
