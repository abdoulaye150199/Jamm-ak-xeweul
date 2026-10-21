import { NextResponse } from 'next/server';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';
import { MEMBER_SESSION_COOKIE, getMemberIdFromSession } from '@/lib/member-auth';
import { addContribution, getMemberById } from '@/lib/site-store';
import { cookies } from 'next/headers';
import { hasRequiredStrings, readJsonObject } from '@/lib/request-validation';
import { getContributionImageError } from '@/lib/contribution-image';

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Le corps de la requête doit être un objet JSON valide.' }, { status: 400 });
    if (isBackendConfigured()) return proxyToBackend(request, '/contributions', body);
    const requiredFields = ['title', 'author', 'neighborhood', 'type', 'description', 'phone'] as const;
    if (!hasRequiredStrings(body, requiredFields)) {
      return NextResponse.json({ error: 'Veuillez renseigner tous les champs obligatoires.' }, { status: 400 });
    }
    if (body.type !== 'Besoin' && body.type !== 'Idée') {
      return NextResponse.json({ error: 'Le type de contribution est invalide.' }, { status: 400 });
    }
    const limits = [['title', 200], ['author', 160], ['neighborhood', 160], ['description', 5000], ['phone', 40]] as const;
    const exceedsLimit = limits.some(([field, limit]) => body[field].length > limit);
    if (exceedsLimit) return NextResponse.json({ error: 'Un ou plusieurs champs sont trop longs.' }, { status: 400 });
    const imageError = getContributionImageError(body.image);
    if (imageError) return NextResponse.json({ error: imageError }, { status: 400 });

    const memberId = getMemberIdFromSession((await cookies()).get(MEMBER_SESSION_COOKIE)?.value);
    if (memberId && !await getMemberById(memberId)) {
      return NextResponse.json({ error: 'Ce compte membre n’est plus disponible. Veuillez vous reconnecter.' }, { status: 401 });
    }

    const contribution = await addContribution({
      title: body.title.trim(),
      author: body.author.trim(),
      neighborhood: body.neighborhood.trim(),
      type: body.type,
      description: body.description.trim(),
      phone: body.phone.trim(),
      image: typeof body.image === 'string' ? body.image : null,
      memberId,
    });
    return NextResponse.json({ ok: true, contribution: { id: contribution.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Impossible d’enregistrer votre contribution.' }, { status: 500 });
  }
}
