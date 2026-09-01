import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getAdminPage, getAdminSnapshot, getRecentNotifications } from '@/lib/site-store';
import { cookies } from 'next/headers';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (isBackendConfigured()) return proxyToBackend(request, `/admin/dashboard${new URL(request.url).search}`);
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const url = new URL(request.url);
  const section = url.searchParams.get('section');
  if (section === 'contributions' || section === 'members' || section === 'events') {
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') ?? 8) || 8));
    const query = url.searchParams.get('q') ?? '';
    const type = url.searchParams.get('type');
    const result = await getAdminPage(section, page, pageSize, query, type === 'Besoin' || type === 'Idée' ? type : undefined);
    return NextResponse.json({ ...result, notifications: await getRecentNotifications() }, { headers: { 'Cache-Control': 'private, no-store' } });
  }
  return NextResponse.json(await getAdminSnapshot());
}
