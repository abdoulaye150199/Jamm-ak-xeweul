import { hasRequiredStrings, parseEventDate } from './request-validation';

export type EventInput = {
  eventDate: Date;
  day: string;
  weekday: string;
  title: string;
  time: string;
  place: string;
  featured: boolean;
};

export function validateEventInput(body: Record<string, unknown>): { input: EventInput; error?: never } | { error: string; input?: never } {
  if (!hasRequiredStrings(body, ['date', 'title', 'time', 'place'] as const)) {
    return { error: 'Veuillez renseigner tous les champs de l’événement.' };
  }
  if (body.title.length > 200 || body.time.length > 80 || body.place.length > 500) {
    return { error: 'Un ou plusieurs champs sont trop longs.' };
  }
  if (body.featured !== undefined && typeof body.featured !== 'boolean') {
    return { error: 'La mise en avant doit être un booléen.' };
  }
  const eventDate = parseEventDate(body.date);
  if (!eventDate) return { error: 'La date est invalide.' };

  return { input: {
    eventDate,
    day: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', timeZone: 'Africa/Dakar' }).format(eventDate),
    weekday: new Intl.DateTimeFormat('fr-FR', { weekday: 'short', timeZone: 'Africa/Dakar' }).format(eventDate).replace('.', ''),
    title: body.title.trim(),
    time: body.time.trim(),
    place: body.place.trim(),
    featured: body.featured === true,
  } };
}
