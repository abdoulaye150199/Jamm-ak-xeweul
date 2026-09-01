'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, FileText, ImagePlus, Lightbulb, MapPinned, Mic, MicOff, Send, ShieldCheck, Target, Users } from 'lucide-react';
import { ActivityCard, ChatWidget, Footer, PublicHeader } from '@/components/site';
import { activities } from '@/lib/data';

export function ContentPage({ type }: { type: 'movement' | 'axes' | 'activities' }) {
  if (type === 'activities') return <ActivitiesPage />;
  const movement = type === 'movement';
  return <div className="min-h-screen bg-[#f6faf7]"><PublicHeader /><main><section className="hero-grid relative overflow-hidden px-5 py-20 text-white lg:py-28"><div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" /><div className="relative mx-auto max-w-7xl"><p className="eyebrow text-sun-400">{movement ? 'Notre raison d’être' : 'Construire ensemble'}</p><h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-tight sm:text-6xl">{movement ? 'Un mouvement né de l’écoute.' : 'Des priorités claires pour Thiès-Nord.'}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">{movement ? 'JÀMM AK XÉEWAL rassemble les forces vives de Thiès-Nord autour d’une même conviction : les meilleures solutions se construisent avec les habitants.' : 'Nos pôles d’action organisent les idées et les énergies autour de sujets concrets, pensés avec les habitants.'}</p></div></section><section className="mx-auto max-w-7xl px-5 py-20 lg:py-28"><div className="grid gap-12 lg:grid-cols-2 lg:items-center"><div><p className="eyebrow text-brand-600">{movement ? 'Notre méthode' : 'Notre approche'}</p><h2 className="mt-4 text-4xl font-extrabold text-brand-900">{movement ? 'La proximité avant les promesses.' : 'Passer des besoins aux solutions.'}</h2><p className="mt-6 leading-8 text-slate-500">Nous partons du terrain : une écoute attentive, des échanges réguliers, puis des actions mesurables. Chaque citoyen peut contribuer à son rythme et voir ce que sa participation rend possible.</p><Link href="/inscription" className="btn-primary mt-8">Rejoindre la démarche <ArrowRight size={16} /></Link></div><div className="grid gap-4 sm:grid-cols-2">{(movement ? [{ icon: <Users />, title: 'Écouter', text: 'Recueillir la parole des quartiers.' }, { icon: <Target />, title: 'Prioriser', text: 'Transformer les besoins en axes.' }, { icon: <CheckCircle2 />, title: 'Agir', text: 'Mettre les équipes sur le terrain.' }, { icon: <MapPinned />, title: 'Rendre compte', text: 'Partager les avancées avec transparence.' }] : [{ icon: <Target />, title: 'Emploi & formation', text: 'Créer des opportunités locales.' }, { icon: <MapPinned />, title: 'Cadre de vie', text: 'Améliorer nos rues et espaces.' }, { icon: <Users />, title: 'Jeunesse & sport', text: 'Faire grandir les talents.' }, { icon: <Lightbulb />, title: 'Innovation citoyenne', text: 'Encourager les projets utiles.' }]).map(item => <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{item.icon}</div><h3 className="font-extrabold text-brand-900">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p></div>)}</div></div></section><section className="bg-brand-900 px-5 py-20 text-center text-white"><div className="mx-auto max-w-2xl"><p className="eyebrow text-sun-400">À vous de jouer</p><h2 className="mt-4 text-4xl font-extrabold">Une idée, un besoin, une envie d’agir ?</h2><p className="mt-4 leading-7 text-white/60">Votre contribution est le point de départ d’une action collective.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/signaler" className="btn-primary !bg-sun-500 !text-brand-950 hover:!bg-sun-400">Signaler un besoin <ArrowRight size={16} /></Link><Link href="/idee" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Proposer une idée <Lightbulb size={16} /></Link></div></div></section></main><Footer /><ChatWidget /></div>;
}

function ActivitiesPage() { return <div className="min-h-screen bg-[#f6faf7]"><PublicHeader /><main><section className="hero-grid px-5 py-20 text-white lg:py-24"><div className="mx-auto max-w-7xl"><p className="eyebrow text-sun-400">Sur le terrain</p><h1 className="mt-4 text-5xl font-extrabold">Nos activités.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-white/65">Des rencontres, des actions concrètes et des moments pour faire vivre la solidarité dans nos quartiers.</p></div></section><section className="mx-auto max-w-7xl px-5 py-20"><div className="mb-10 flex items-end justify-between"><div><p className="eyebrow text-brand-600">Galerie</p><h2 className="mt-3 text-4xl font-extrabold text-brand-900">Les moments forts</h2></div><span className="hidden text-sm font-bold text-slate-400 sm:block">{activities.length} activités publiées</span></div><div className="grid gap-5 md:grid-cols-3">{activities.map(activity => <ActivityCard key={activity.title} activity={activity} />)}</div></section></main><Footer /><ChatWidget /></div>; }

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: { length: number; [index: number]: { length: number; [index: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function VoiceDescription({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  function toggleListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError('La saisie vocale n’est pas disponible sur ce navigateur.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = event => {
      let spoken = '';
      for (let index = 0; index < event.results.length; index += 1) spoken += `${event.results[index][0]?.transcript ?? ''} `;
      onChange(`${value}${value && spoken ? ' ' : ''}${spoken.trim()}`);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setError('Impossible d’utiliser le microphone. Vérifiez son autorisation.'); };
    recognitionRef.current = recognition;
    setError('');
    setListening(true);
    recognition.start();
  }

  return <div>
    <div className={`rounded-2xl border p-3 transition ${listening ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-[#fbfcfb]'}`}>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={toggleListening} className={`flex min-w-0 items-center gap-3 text-left ${listening ? 'text-red-600' : 'text-brand-900'}`}>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${listening ? 'animate-pulse bg-red-500 text-white' : 'bg-brand-100 text-brand-600'}`}>{listening ? <MicOff size={19} /> : <Mic size={19} />}</span>
          <span><strong className="block text-sm">{listening ? 'Je vous écoute…' : 'Appuyez pour parler'}</strong><span className="text-xs text-slate-500">Français · votre voix sera transcrite</span></span>
        </button>
        <span className="hidden rounded-full bg-brand-50 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-brand-600 sm:inline-flex">Ou écrivez ci-dessous</span>
      </div>
      <textarea required value={value} onChange={event => onChange(event.target.value)} rows={4} className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" placeholder="Décrivez le problème ou dictez votre signalement..." />
    </div>
    {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
  </div>;
}

export function ContributionPage({ kind }: { kind: 'need' | 'idea' }) {
  const [submitted, setSubmitted] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isNeed = kind === 'need';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: formData.get('author'),
          phone: formData.get('phone'),
          neighborhood: formData.get('neighborhood'),
          title: formData.get('title'),
          description,
          type: isNeed ? 'Besoin' : 'Idée',
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Impossible d’enregistrer votre contribution.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Une erreur réseau est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return <div className="min-h-screen overflow-hidden bg-[#f6faf7]">
    <PublicHeader />
    <main>
      <section className="contribution-hero relative isolate overflow-hidden bg-[#003d25] px-5 pb-20 pt-16 text-white lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-sun-500/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:gap-16">
          <div className="pt-3 lg:pt-12">
            <p className="eyebrow flex items-center gap-3 text-sun-400"><span className="h-px w-10 bg-sun-400" /> {isNeed ? 'La parole du terrain' : 'La boîte à idées'}</p>
            <h1 className="display-title mt-6 max-w-xl text-5xl font-black leading-[.94] sm:text-6xl lg:text-[5.2rem]">{isNeed ? <>Un besoin signalé,<br /><span className="text-sun-400">une action possible.</span></> : <>Les bonnes idées<br /><span className="text-sun-400">commencent ici.</span></>}</h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/65 sm:text-lg">{isNeed ? 'Décrivez un problème observé dans votre quartier. Chaque signalement nous aide à mieux comprendre Thiès-Nord et à agir au plus près des habitants.' : 'Partagez une proposition pour améliorer la vie à Thiès-Nord. Chaque idée peut devenir le début d’une action collective.'}</p>
            <div className="mt-10 grid max-w-lg gap-3 sm:grid-cols-2">
              <div className="border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><ShieldCheck size={20} className="mb-5 text-sun-400" /><p className="text-sm font-extrabold">Une écoute attentive</p><p className="mt-1 text-xs leading-5 text-white/50">Votre contribution est lue par notre équipe.</p></div>
              <div className="border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><CheckCircle2 size={20} className="mb-5 text-sun-400" /><p className="text-sm font-extrabold">Un suivi transparent</p><p className="mt-1 text-xs leading-5 text-white/50">Un accusé de réception vous sera envoyé.</p></div>
            </div>
          </div>

          <div className="relative rounded-[2rem] border-2 border-white/80 bg-white p-6 text-brand-900 shadow-2xl sm:p-9">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sun-500 via-sun-400 to-brand-600" />
            <div className="mb-8 flex items-start gap-4 border-b border-slate-100 pb-6">
              <div className={`rounded-2xl p-3 ${isNeed ? 'bg-sun-50 text-sun-600' : 'bg-brand-50 text-brand-600'}`}>{isNeed ? <FileText size={24} /> : <Lightbulb size={24} />}</div>
              <div><p className="eyebrow text-brand-600">Votre contribution</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">{isNeed ? 'Déclarer un besoin' : 'Proposer une idée'}</h2><p className="mt-1 text-sm text-slate-500">Les champs marqués * sont obligatoires.</p></div>
            </div>
            {submitted ? <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-brand-700"><Check className="mb-3" /><h3 className="text-xl font-extrabold">Merci pour votre contribution.</h3><p className="mt-2 text-sm leading-6">Votre demande a bien été enregistrée. Vous pourrez suivre son évolution depuis votre espace citoyen.</p><Link href="/espace-membre" className="mt-5 inline-flex items-center gap-2 font-bold underline">Accéder à mon espace <ArrowRight size={15} /></Link></div> : <form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-bold text-slate-700">Votre nom *</span><input name="author" required className="input-focus" placeholder="Awa Diop" /></label><label><span className="mb-2 block text-sm font-bold text-slate-700">Téléphone *</span><input name="phone" required className="input-focus" placeholder="+221 77 000 00 00" /></label></div><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Quartier *</span><select name="neighborhood" required className="input-focus"><option value="">Sélectionner un quartier</option><option>Nguinth</option><option>Diakhao</option><option>Keur Mame El Hadj</option></select></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{isNeed ? 'Titre du besoin *' : 'Titre de votre idée *'}</span><input name="title" required className="input-focus" placeholder={isNeed ? 'Ex. Éclairage public rue 14' : 'Ex. Atelier de formation numérique'} /></label><div><span className="mb-2 block text-sm font-bold text-slate-700">{isNeed ? 'Décrivez le problème *' : 'Décrivez votre proposition *'}</span><VoiceDescription value={description} onChange={setDescription} /></div><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-brand-400 hover:bg-brand-50"><ImagePlus size={18} className="text-brand-500" /> Joindre une photo <span className="font-normal text-slate-400">(optionnel)</span><input type="file" accept="image/*" className="sr-only" /></label><label className="flex items-start gap-2 text-xs leading-5 text-slate-500"><input required type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" /> J’autorise JÀMM AK XÉEWAL à utiliser ces informations pour traiter ma contribution.</label>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}<button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3.5 text-sm font-bold text-sun-400 shadow-lg shadow-brand-900/20 transition hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Envoi en cours…' : 'Envoyer ma contribution'} {!loading && <Send size={16} />}</button></form>}
          </div>
        </div>
      </section>
      <section className="soft-grid bg-[#f4f4f1] px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <ContributionStep number="01" title="Vous partagez" text="Un besoin concret, une idée ou une observation de votre quartier." />
          <ContributionStep number="02" title="Nous étudions" text="Notre équipe qualifie chaque contribution avec les acteurs concernés." />
          <ContributionStep number="03" title="Nous avançons" text="Les actions et leur évolution sont partagées avec la communauté." />
        </div>
      </section>
    </main>
    <Footer />
  </div>;
}

function ContributionStep({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="border-t border-brand-900/15 pt-5"><p className="text-xs font-extrabold tracking-[.2em] text-brand-500">{number}</p><h3 className="mt-3 text-lg font-extrabold text-brand-900">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{text}</p></div>;
}
