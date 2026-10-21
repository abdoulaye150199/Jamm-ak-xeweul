import { NextResponse } from 'next/server';
import { createMemberSessionToken, hashMemberPassword } from '@/lib/member-auth';
import { isBackendConfigured, proxyToBackend } from '@/lib/backend-client';
import { addMember } from '@/lib/site-store';
import { hasRequiredStrings, readJsonObject } from '@/lib/request-validation';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUniqueConstraintError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: unknown; cause?: { code?: unknown } };
  return candidate.code === '23505' || candidate.cause?.code === '23505';
}

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Le corps de la requête doit être un objet JSON valide.' }, { status: 400 });
    if (isBackendConfigured()) return proxyToBackend(request, '/members', body);
    const requiredFields = ['firstName', 'lastName', 'email', 'neighborhood', 'phone', 'password'] as const;
    if (!hasRequiredStrings(body, requiredFields)) {
      return NextResponse.json({ error: 'Veuillez renseigner tous les champs obligatoires.' }, { status: 400 });
    }
    if (!emailPattern.test(body.email.trim()) || body.email.trim().length > 255) {
      return NextResponse.json({ error: 'L’adresse e-mail est invalide.' }, { status: 400 });
    }
    if (body.firstName.length > 100 || body.lastName.length > 100 || body.neighborhood.length > 160 || body.phone.length > 40) {
      return NextResponse.json({ error: 'Un ou plusieurs champs sont trop longs.' }, { status: 400 });
    }
    if (body.password.length < 8 || body.password.length > 128) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir entre 8 et 128 caractères.' }, { status: 400 });
    }

    const member = await addMember({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      neighborhood: body.neighborhood.trim(),
      phone: body.phone.trim(),
      passwordHash: hashMemberPassword(body.password),
    });
    const response = NextResponse.json({ ok: true, member: { id: member.id } }, { status: 201 });
    response.cookies.set('jamm_member_session', createMemberSessionToken(member.id), {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  } catch (error) {
    const databaseError = error as { name?: string; code?: unknown; error?: { code?: string }; cause?: { name?: string; code?: unknown; constraint?: unknown; message?: string } };
    const errorCode = databaseError.code ?? databaseError.cause?.code;
    const constraint = databaseError.cause?.constraint;
    console.error('Member registration failed:', { name: databaseError.name, code: errorCode ?? databaseError.error?.code, constraint, cause: databaseError.cause?.name });
    if (errorCode === '23505' || isUniqueConstraintError(error)) {
      return NextResponse.json({ error: 'Cette adresse e-mail est déjà utilisée.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Impossible d’enregistrer votre adhésion.' }, { status: 500 });
  }
}
