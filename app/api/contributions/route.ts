import { NextResponse } from 'next/server';
import { addContribution } from '@/lib/site-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requiredFields = ['title', 'author', 'neighborhood', 'type', 'description', 'phone'];
    if (requiredFields.some(field => typeof body[field] !== 'string' || !body[field].trim())) {
      return NextResponse.json({ error: 'Veuillez renseigner tous les champs obligatoires.' }, { status: 400 });
    }
    if (body.type !== 'Besoin' && body.type !== 'Idée') {
      return NextResponse.json({ error: 'Le type de contribution est invalide.' }, { status: 400 });
    }

    const contribution = await addContribution({
      title: body.title.trim(),
      author: body.author.trim(),
      neighborhood: body.neighborhood.trim(),
      type: body.type,
      description: body.description.trim(),
      phone: body.phone.trim(),
    });
    return NextResponse.json({ ok: true, contribution: { id: contribution.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Impossible d’enregistrer votre contribution.' }, { status: 400 });
  }
}
