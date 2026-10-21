import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';
import { isUuid } from '@/lib/request-validation';
import { deleteMember, getAdminMemberDetails } from '@/lib/site-store';

export const dynamic = 'force-dynamic';
type MemberRouteContext = { params: Promise<{ id: string }> };

async function authorizeRequest(request: Request, id: string): Promise<Response | null> {
  const backendConfigured = isBackendConfigured();
  if (!backendConfigured && !isValidAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  if (!isUuid(id)) return NextResponse.json({ error: 'L’identifiant du membre est invalide.' }, { status: 400 });
  return backendConfigured ? proxyToBackend(request, `/admin/members/${id}`) : null;
}

export async function GET(request: Request, { params }: MemberRouteContext) {
  try {
    const { id } = await params;
    const response = await authorizeRequest(request, id);
    if (response) return response;
    const details = await getAdminMemberDetails(id);
    if (!details) return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
    return NextResponse.json(details, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Impossible de charger les détails du membre. Réessayez.' }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: MemberRouteContext) {
  try {
    const { id } = await params;
    const response = await authorizeRequest(request, id);
    if (response) return response;
    const member = await deleteMember(id);
    if (!member) return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Impossible de supprimer ce membre. Réessayez.' }, { status: 503 });
  }
}
