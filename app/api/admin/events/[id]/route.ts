import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';
import { validateEventInput } from '@/lib/event-input';
import { isUuid, readJsonObject } from '@/lib/request-validation';
import { deleteEvent, updateEvent } from '@/lib/site-store';

export const dynamic = 'force-dynamic';
type EventRouteContext = { params: Promise<{ id: string }> };

async function authorizeRequest(id: string) {
  if (!isBackendConfigured() && !isValidAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  if (!isUuid(id)) return NextResponse.json({ error: 'L’identifiant de l’événement est invalide.' }, { status: 400 });
  return null;
}

export async function PATCH(request: Request, { params }: EventRouteContext) {
  try {
    const { id } = await params;
    const response = await authorizeRequest(id);
    if (response) return response;
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Le corps de la requête doit être un objet JSON valide.' }, { status: 400 });
    if (isBackendConfigured()) return proxyToBackend(request, `/admin/events/${id}`, body);
    const result = validateEventInput(body);
    if (!result.input) return NextResponse.json({ error: result.error }, { status: 400 });
    const event = await updateEvent(id, result.input);
    if (!event) return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
    return NextResponse.json({ ok: true, event }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Impossible de modifier cet événement. Réessayez.' }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: EventRouteContext) {
  try {
    const { id } = await params;
    const response = await authorizeRequest(id);
    if (response) return response;
    if (isBackendConfigured()) return proxyToBackend(request, `/admin/events/${id}`);
    const event = await deleteEvent(id);
    if (!event) return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Impossible de supprimer cet événement. Réessayez.' }, { status: 503 });
  }
}
