import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';
import { MEMBER_SESSION_COOKIE, getMemberIdFromSession } from '@/lib/member-auth';
import { getMemberById, getMemberNotifications, markMemberNotificationsRead } from '@/lib/site-store';

export async function GET(request: Request) {
  if (isBackendConfigured()) return proxyToBackend(request, '/members/notifications');
  const memberId = getMemberIdFromSession((await cookies()).get(MEMBER_SESSION_COOKIE)?.value);
  if (!memberId || !await getMemberById(memberId)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  return NextResponse.json(await getMemberNotifications(memberId), { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  if (isBackendConfigured()) return proxyToBackend(request, '/members/notifications');
  const memberId = getMemberIdFromSession((await cookies()).get(MEMBER_SESSION_COOKIE)?.value);
  if (!memberId || !await getMemberById(memberId)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  await markMemberNotificationsRead(memberId);
  return NextResponse.json({ ok: true });
}
