'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';

export function LoginForm() {
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true); }
  if (submitted) return <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-sm leading-6 text-brand-700"><div className="mb-3 flex items-center gap-2 font-extrabold"><Check size={18} /> Connexion réussie</div><Link href="/espace-membre" className="font-bold underline">Accéder à mon espace citoyen</Link></div>;
  return <form onSubmit={submit} className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Adresse e-mail</span><span className="relative block"><Mail size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" /><input required type="email" placeholder="vous@exemple.sn" className="input-focus !pl-12" /></span></label><label className="block"><span className="mb-2 flex justify-between text-sm font-bold text-slate-700"><span>Mot de passe</span><Link href="#" className="font-semibold text-brand-600 hover:text-brand-700">Mot de passe oublié ?</Link></span><span className="relative block"><LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" /><input required type={show ? 'text' : 'password'} placeholder="••••••••" className="input-focus !pl-12 !pr-12" /><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label><label className="flex items-center gap-2 text-sm text-slate-500"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Se souvenir de moi</label><button className="btn-primary w-full py-3.5">Se connecter <ArrowRight size={16} /></button></form>;
}

export function JoinForm() {
  const [submitted, setSubmitted] = useState(false);
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
  if (submitted) return <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-sm leading-6 text-brand-700"><div className="mb-2 flex items-center gap-2 font-extrabold"><Check size={18} /> Bienvenue dans le mouvement !</div><p>Votre demande a été enregistrée. Vous pouvez maintenant accéder à votre espace.</p><Link href="/espace-membre" className="mt-3 inline-flex font-bold underline">Ouvrir mon espace</Link></div>;
  return <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Prénom</span><span className="relative block"><UserRound size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" /><input name="firstName" required className="input-focus !pl-12" placeholder="Votre prénom" /></span></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Nom</span><input name="lastName" required className="input-focus" placeholder="Votre nom" /></label><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">Adresse e-mail</span><span className="relative block"><Mail size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" /><input name="email" required type="email" className="input-focus !pl-12" placeholder="vous@exemple.sn" /></span></label><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">Quartier</span><select name="neighborhood" required className="input-focus"><option value="">Choisir votre quartier</option><option>Nguinth</option><option>Diakhao</option><option>Keur Mame El Hadj</option><option>Autre quartier de Thiès-Nord</option></select></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Téléphone</span><input name="phone" required className="input-focus" placeholder="Votre numéro de téléphone" /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Mot de passe</span><input name="password" required minLength={8} type="password" className="input-focus" placeholder="8 caractères minimum" /></label><label className="flex items-start gap-2 pt-1 text-xs leading-5 text-slate-500 sm:col-span-2"><input required type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" /> J’accepte la charte citoyenne et la politique de confidentialité.</label>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 sm:col-span-2">{error}</p>}<button disabled={loading} className="btn-primary sm:col-span-2 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Enregistrement…' : 'Créer mon espace'} {!loading && <ArrowRight size={16} />}</button></form>;
}
