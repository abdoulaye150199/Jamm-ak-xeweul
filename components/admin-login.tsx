'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/site';

export function AdminLogin() {
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
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Connexion refusée.');
        return;
      }
      window.location.assign('/admin');
    } catch {
      setError('Une erreur réseau est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="grid min-h-screen bg-white lg:grid-cols-2"><div className="hero-grid relative hidden overflow-hidden lg:block"><div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" /><div className="relative flex h-full flex-col justify-between p-12 text-white"><Logo light /><div className="max-w-lg pb-16"><p className="eyebrow text-sun-400">Administration</p><h1 className="mt-5 text-5xl font-extrabold leading-tight">Pilotez l’action citoyenne.</h1><p className="mt-6 text-lg leading-8 text-white/65">Retrouvez les contributions, les membres et les activités de JÀMM AK XÉEWAL.</p><div className="mt-9 flex items-center gap-3 text-sm text-white/70"><ShieldCheck size={19} className="text-brand-200" /> Accès réservé à l’équipe.</div></div><p className="text-xs text-white/40">JÀMM AK XÉEWAL · Thiès-Nord</p></div></div><div className="flex items-center justify-center px-5 py-10"><div className="w-full max-w-md"><div className="mb-10 lg:hidden"><Logo /></div><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600"><ArrowLeft size={16} /> Retour à l’accueil</Link><p className="eyebrow text-brand-600">Espace sécurisé</p><h1 className="mt-3 text-4xl font-extrabold text-brand-900">Connexion admin</h1><p className="mt-3 text-slate-500">Connectez-vous pour accéder au tableau de bord.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Adresse e-mail</span><span className="relative block"><Mail size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" placeholder="admin@exemple.sn" className="input-focus !pl-12" /></span></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Mot de passe</span><span className="relative block"><LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" /><input required type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" placeholder="Votre mot de passe" className="input-focus !pl-12 !pr-12" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}<button disabled={loading} className="btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Connexion…' : 'Se connecter'} <ArrowRight size={16} /></button></form></div></div></main>;
}
