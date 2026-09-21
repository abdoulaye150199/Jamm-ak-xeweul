import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { JoinForm } from '@/components/forms';
import { Logo } from '@/components/site';

export default function Inscription() {
  return (
    <main className="relative min-h-screen bg-[#f5f9f6] text-brand-950 lg:h-[100svh] lg:overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-sun-500/10 blur-3xl" />

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:h-20 lg:py-0">
        <div className="flex flex-col items-start gap-2">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-brand-600">
            <ArrowLeft size={16} /> Retour à l’accueil
          </Link>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 pb-10 pt-5 sm:px-8 md:grid-cols-2 md:items-center md:gap-10 lg:h-[calc(100svh-5rem)] lg:overflow-hidden lg:pb-8 lg:pt-2">
        <section className="md:flex md:items-center">
          <div className="max-w-md">
            <p className="eyebrow mt-12 text-brand-600 lg:mt-16">Rejoindre le mouvement</p>
            <h1 className="display-title mt-4 text-5xl font-extrabold leading-[.94] text-brand-950 sm:text-6xl">Rejoignez-nous.</h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">Un espace simple pour agir près de chez vous.</p>
            <div className="mt-8 flex items-center gap-3 text-sm font-bold text-brand-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><ShieldCheck size={18} /></span>
              Vos informations restent confidentielles.
            </div>
          </div>
        </section>

        <section className="relative w-full max-w-[520px] justify-self-end rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_20px_55px_rgba(20,38,29,.08)] sm:p-7 lg:max-h-full lg:overflow-hidden lg:p-7">
          <div className="absolute inset-x-8 top-0 h-1.5 rounded-b-full bg-gradient-to-r from-brand-600 to-sun-500 sm:inset-x-10" />
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <h2 className="text-2xl font-extrabold tracking-tight text-brand-950">Créer mon espace</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-brand-600">1 minute</span>
          </div>
          <div className="pt-5">
            <JoinForm />
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">
            Déjà membre ?{' '}
            <Link href="/connexion" className="font-extrabold text-brand-600">Se connecter</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
