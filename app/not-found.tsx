import Link from 'next/link';

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f4f4f1] px-5 text-center"><div><p className="eyebrow text-brand-600">404</p><h1 className="mt-3 text-4xl font-extrabold text-brand-900">Page introuvable.</h1><p className="mt-3 text-slate-500">Cette page n’existe pas ou n’est plus disponible.</p><Link href="/" className="btn-primary mt-6">Retour à l’accueil</Link></div></main>;
}
