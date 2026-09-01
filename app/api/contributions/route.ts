import { NextResponse } from 'next/server';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';
import { MEMBER_SESSION_COOKIE, getMemberIdFromSession } from '@/lib/member-auth';
import { addContribution } from '@/lib/site-store';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (isBackendConfigured()) return proxyToBackend(request, '/contributions', body);
    const requiredFields = ['title', 'author', 'neighborhood', 'type', 'description', 'phone'];
    if (requiredFields.some(field => typeof body[field] !== 'string' || !body[field].trim())) {
      return NextResponse.json({ error: 'Veuillez renseigner tous les champs obligatoires.' }, { status: 400 });
    }
    if (body.type !== 'Besoin' && body.type !== 'Idée') {
      return NextResponse.json({ error: 'Le type de contribution est invalide.' }, { status: 400 });
    }
    const limits: Record<string, number> = { title: 200, author: 160, neighborhood: 160, description: 5000, phone: 40 };
    const exceedsLimit = Object.entries(limits).some(([field, limit]) => body[field].length > limit);
    if (exceedsLimit) return NextResponse.json({ error: 'Un ou plusieurs champs sont trop longs.' }, { status: 400 });

    const contribution = await addContribution({
      title: body.title.trim(),
      author: body.author.trim(),
      neighborhood: body.neighborhood.trim(),
      type: body.type,
      description: body.description.trim(),
      phone: body.phone.trim(),
      memberId: getMemberIdFromSession(cookies().get(MEMBER_SESSION_COOKIE)?.value),
    });
    return NextResponse.json({ ok: true, contribution: { id: contribution.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Impossible d’enregistrer votre contribution.' }, { status: 500 });
  }
}
