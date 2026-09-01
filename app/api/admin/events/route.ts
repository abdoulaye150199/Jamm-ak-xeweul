import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { addEvent } from '@/lib/site-store';
import { cookies } from 'next/headers';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';

export async function POST(request: Request) {
  if (isBackendConfigured()) return proxyToBackend(request, '/admin/events', await request.json());
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  try {
    const body = await request.json();
    const requiredFields = ['date', 'title', 'time', 'place'];
    if (requiredFields.some(field => typeof body[field] !== 'string' || !body[field].trim())) {
      return NextResponse.json({ error: 'Veuillez renseigner tous les champs de l’événement.' }, { status: 400 });
    }
    if (body.title.length > 200 || body.time.length > 80 || body.place.length > 500) {
      return NextResponse.json({ error: 'Un ou plusieurs champs sont trop longs.' }, { status: 400 });
    }

    const eventDate = new Date(`${body.date}T12:00:00`);
    if (Number.isNaN(eventDate.getTime())) return NextResponse.json({ error: 'La date est invalide.' }, { status: 400 });

    const event = await addEvent({
      day: new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(eventDate),
      weekday: new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(eventDate).replace('.', ''),
      eventDate,
      title: body.title.trim(),
      time: body.time.trim(),
      place: body.place.trim(),
      featured: body.featured === true,
    });
    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Impossible de publier cet événement.' }, { status: 500 });
  }
}
