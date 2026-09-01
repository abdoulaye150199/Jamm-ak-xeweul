import { NextResponse } from 'next/server';
import { addMember } from '@/lib/site-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requiredFields = ['firstName', 'lastName', 'email', 'neighborhood', 'phone', 'password'];
    if (requiredFields.some(field => typeof body[field] !== 'string' || !body[field].trim())) {
      return NextResponse.json({ error: 'Veuillez renseigner tous les champs obligatoires.' }, { status: 400 });
    }

    const member = await addMember({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      neighborhood: body.neighborhood.trim(),
      phone: body.phone.trim(),
    });
    return NextResponse.json({ ok: true, member: { id: member.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Impossible d’enregistrer votre adhésion.' }, { status: 400 });
  }
}
