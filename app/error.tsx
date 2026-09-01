'use client';

import { AppButton } from '@/components/ui';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#f4f4f1] px-5 text-center"><div><p className="eyebrow text-brand-600">Une erreur est survenue</p><h1 className="mt-3 text-3xl font-extrabold text-brand-900">Impossible de charger cette page.</h1><AppButton type="button" onClick={() => reset()} className="mt-6">Réessayer</AppButton></div></main>;
}
