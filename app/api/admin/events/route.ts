import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { addEvent } from '@/lib/site-store';
import { cookies } from 'next/headers';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';
import { readJsonObject } from '@/lib/request-validation';
import { validateEventInput } from '@/lib/event-input';

export async function POST(request: Request) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!isBackendConfigured() && !isValidAdminSession(session)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Le corps de la requête doit être un objet JSON valide.' }, { status: 400 });
    if (isBackendConfigured()) return proxyToBackend(request, '/admin/events', body);
    const result = validateEventInput(body);
    if (!result.input) return NextResponse.json({ error: result.error }, { status: 400 });
    const event = await addEvent(result.input);
    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Impossible de publier cet événement.' }, { status: 500 });
  }
}
