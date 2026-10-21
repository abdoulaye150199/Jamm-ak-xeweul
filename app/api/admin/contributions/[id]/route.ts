import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';
import { updateContributionStatus } from '@/lib/site-store';
import { isUuid } from '@/lib/request-validation';

const statuses = ['Nouveau', 'En étude', 'En cours', 'Résolu'] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (isBackendConfigured()) return proxyToBackend(request, `/admin/contributions/${id}`, body);

  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  if (!isUuid(id)) return NextResponse.json({ error: 'L’identifiant de la contribution est invalide.' }, { status: 400 });
  if (!body || typeof body.status !== 'string' || !statuses.includes(body.status as typeof statuses[number])) {
    return NextResponse.json({ error: 'Le statut de la contribution est invalide.' }, { status: 400 });
  }

  const contribution = await updateContributionStatus(id, body.status as typeof statuses[number]);
  if (!contribution) return NextResponse.json({ error: 'Contribution introuvable.' }, { status: 404 });
  return NextResponse.json({ ok: true, contribution });
}
