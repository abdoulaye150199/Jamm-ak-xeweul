import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getAdminSnapshot } from '@/lib/site-store';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  return NextResponse.json(await getAdminSnapshot());
}
