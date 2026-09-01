import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { markNotificationsRead } from '@/lib/site-store';
import { cookies } from 'next/headers';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';

export async function POST(request: Request) {
  if (isBackendConfigured()) return proxyToBackend(request, '/admin/notifications');
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  await markNotificationsRead();
  return NextResponse.json({ ok: true });
}
