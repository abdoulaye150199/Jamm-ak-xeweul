'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, Eye, EyeOff, LockKeyhole, Mail, MapPin, Phone, UserRound } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/members/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Connexion refusée.');
        return;
      }
      window.location.assign('/espace-membre');
    } catch {
      setError('Une erreur réseau est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="space-y-5">
    <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Adresse e-mail</span><span className="relative block"><Mail size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" placeholder="vous@exemple.sn" className="input-focus !pl-12" /></span></label>
    <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Mot de passe</span><span className="relative block"><LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" /><input required type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" placeholder="••••••••" className="input-focus !pl-12 !pr-12" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
    <p className="text-xs text-slate-400">Le lien de récupération du mot de passe sera disponible prochainement.</p>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
    <button disabled={loading} className="btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Connexion…' : 'Se connecter'} {!loading && <ArrowRight size={16} />}</button>
  </form>;
}

function Field({ label, icon, children, className = '' }: { label: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}>
    <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">{label}</span>
    <span className="relative block">
      <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-brand-500">{icon}</span>
      {children}
    </span>
  </label>;
}

export function JoinForm() {
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          neighborhood: formData.get('neighborhood'),
          phone: formData.get('phone'),
          password: formData.get('password'),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Impossible d’enregistrer votre adhésion.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Une erreur réseau est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return <div className="rounded-[1.5rem] border border-brand-200 bg-brand-50 p-6 text-brand-900">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white"><Check size={22} strokeWidth={3} /></div>
    <h3 className="mt-5 text-xl font-extrabold">Bienvenue dans le mouvement !</h3>
    <p className="mt-2 text-sm leading-6 text-brand-900/65">Votre compte a été créé et votre session est ouverte. Vous pouvez maintenant suivre vos contributions.</p>
    <Link href="/espace-membre" className="btn-primary mt-5 w-full">Ouvrir mon espace <ArrowRight size={16} /></Link>
  </div>;

  return <form onSubmit={submit} className="grid gap-2.5 sm:grid-cols-2 lg:gap-2">
    <Field label="Prénom" icon={<UserRound size={17} />}>
      <input name="firstName" required maxLength={100} autoComplete="given-name" className="input-focus !min-h-11 !pl-12" placeholder="Votre prénom" />
    </Field>
    <Field label="Nom" icon={<UserRound size={17} />}>
      <input name="lastName" required maxLength={100} autoComplete="family-name" className="input-focus !min-h-11 !pl-12" placeholder="Votre nom" />
    </Field>
    <Field label="Adresse e-mail" icon={<Mail size={17} />} className="sm:col-span-2">
      <input name="email" required type="email" maxLength={255} autoComplete="email" className="input-focus !min-h-11 !pl-12" placeholder="vous@exemple.sn" />
    </Field>
    <Field label="Quartier" icon={<MapPin size={17} />} className="sm:col-span-2">
      <select name="neighborhood" required defaultValue="" className="input-focus !min-h-11 !cursor-pointer !appearance-none !pl-12 !pr-11">
        <option value="" disabled>Choisir votre quartier</option>
        <option>Nguinth</option>
        <option>Diakhao</option>
        <option>Keur Mame El Hadj</option>
        <option>Autre quartier de Thiès-Nord</option>
      </select>
      <ChevronDown size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
    </Field>
    <Field label="Téléphone" icon={<Phone size={17} />}>
      <input name="phone" required type="tel" maxLength={40} autoComplete="tel" className="input-focus !min-h-11 !pl-12" placeholder="77 000 00 00" />
    </Field>
    <Field label="Mot de passe" icon={<LockKeyhole size={17} />}>
      <input name="password" required minLength={8} maxLength={128} type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="input-focus !min-h-11 !pl-12 !pr-12" placeholder="8 caractères minimum" />
      <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-brand-600">
        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </Field>

    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 text-[11px] leading-4 text-slate-600 sm:col-span-2">
      <input required type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 accent-brand-600" />
      <span>J’accepte la charte et la politique de confidentialité.</span>
    </label>
    {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 sm:col-span-2">{error}</p>}
    <div className="space-y-3 sm:col-span-2">
      <div className="flex justify-center">
        <button disabled={loading} className="btn-primary w-full max-w-[360px] rounded-2xl py-3 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'Création…' : 'Créer mon espace'} {!loading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  </form>;
}
