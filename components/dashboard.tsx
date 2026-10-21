'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Activity, ArrowUpRight, Bell, CalendarDays, Check, ChevronRight, Clock3, FileText, Home, ImagePlus, Lightbulb, LogOut, MapPin, Plus, Send, Settings, Users, X } from 'lucide-react';
import { formatRelativeDate } from '@/lib/format';
import { MobileBottomNav } from '@/components/header';

type Member = { firstName: string; lastName: string; email: string; neighborhood: string; phone: string };
type MemberContribution = { id: string; title: string; type: 'Besoin' | 'Idée'; status: string; createdAt: string; image: string | null };
type MemberNotification = { id: string; memberId: string | null; type: 'member' | 'event' | 'contribution'; title: string; message: string; createdAt: string; read: boolean };
type MemberActivity = { kind: "agenda"; id: string; day: string; weekday: string; title: string; time: string; place: string } | { kind: "gallery"; id: string; title: string; category: string; date: string; photos: number };

export function MemberDashboard({ member, contributions, activities, notifications }: { member: Member; contributions: MemberContribution[]; activities: MemberActivity[]; notifications: MemberNotification[] }) {
  const router = useRouter();
  const ideas = contributions.filter(item => item.type === 'Idée');
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [contributionType, setContributionType] = useState<'Besoin' | 'Idée'>('Besoin');
  const [sessionError, setSessionError] = useState('');

  function openContributionForm(type: 'Besoin' | 'Idée' = 'Besoin') {
    setContributionType(type);
    setShowContributionForm(true);
  }

  useEffect(() => {
    if (!showContributionForm) return;
    const frame = window.requestAnimationFrame(() => document.getElementById('nouvelle-contribution')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => window.cancelAnimationFrame(frame);
  }, [showContributionForm]);

  async function logout() {
    const response = await fetch('/api/members/logout', { method: 'POST' }).catch(() => null);
    if (!response?.ok) { setSessionError('Impossible de vous déconnecter. Réessayez.'); return; }
    router.push('/connexion');
    router.refresh();
  }

  return <div className="min-h-screen bg-[#f6faf7] pb-[86px] lg:pb-0">
    <DashboardTop member={member} onLogout={logout} notifications={notifications} />
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 lg:grid-cols-[230px_1fr]">
      <DashboardSide onLogout={logout} />
      <main className="min-w-0">
        {sessionError && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{sessionError}</p>}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-brand-600">Espace membre</p>
            <h1 className="mt-2 text-3xl font-extrabold text-brand-900 sm:text-4xl">Bonjour {member.firstName}.</h1>
            <p className="mt-2 text-slate-500">Retrouvez ici vos contributions et votre engagement.</p>
          </div>
          <button onClick={() => openContributionForm()} className="btn-primary self-start"><Plus size={17} /> Nouvelle contribution</button>
        </div>

        {showContributionForm && <MemberContributionForm key={contributionType} member={member} initialType={contributionType} onClose={() => setShowContributionForm(false)} onSubmitted={() => router.refresh()} />}

        <div className="grid gap-4 sm:grid-cols-3">
          <MemberStat label="Contributions" value={contributions.length.toString()} change="envoyées par vous" icon={<FileText />} />
          <MemberStat label="Idées proposées" value={ideas.length.toString()} change="dans votre espace" icon={<Lightbulb />} />
          <MemberStat label="Activités publiées" value={activities.length.toString()} change="dans votre espace" icon={<Activity />} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <ContributionSection
            id="mes-contributions"
            title="Mes contributions"
            description="Tous vos signalements et vos idées envoyés."
            contributions={contributions}
            emptyTitle="Aucune contribution enregistrée"
            emptyActionLabel="Partager un besoin"
            onCreate={() => openContributionForm('Besoin')}
          />
          <section className="rounded-3xl bg-brand-900 p-6 text-white shadow-soft">
            <div className="flex items-start justify-between"><div><p className="eyebrow text-sun-400">Dans votre espace</p><h2 className="mt-3 text-2xl font-extrabold">Activités du mouvement</h2></div><span className="rounded-xl bg-white/10 p-2.5 text-sun-400"><Bell size={18} /></span></div>
            <p className="mt-4 text-sm leading-6 text-white/60">Retrouvez les activités et les prochains rendez-vous sans quitter votre espace.</p>
            {activities.length ? <div className="mt-6 space-y-3">{activities.slice(0, 2).map(activity => <ActivityPreview key={activity.id} activity={activity} dark />)}</div> : <div className="mt-6 flex items-center gap-3 border-y border-white/10 py-5"><div className="rounded-xl bg-sun-500 p-3 text-brand-950"><Activity size={22} /></div><p className="text-sm text-white/70">Les prochaines activités seront publiées ici.</p></div>}
            <Link href="#activites" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold transition hover:bg-brand-500">Afficher les activités <ArrowUpRight size={15} /></Link>
          </section>
        </div>

        <ContributionSection
          id="mes-idees"
          title="Mes idées"
          description="Les propositions que vous avez partagées avec le mouvement."
          contributions={ideas}
          emptyTitle="Aucune idée proposée"
          emptyActionLabel="Proposer une idée"
          onCreate={() => openContributionForm('Idée')}
          className="mt-6"
          ideaSection
        />

        <section id="activites" className="mt-6 scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-brand-600">Votre agenda</p><h2 className="mt-2 text-xl font-extrabold text-brand-900">Toutes les activités</h2><p className="mt-1 text-sm text-slate-500">Les rendez-vous publiés par l’équipe sont visibles directement ici.</p></div><CalendarDays className="shrink-0 text-brand-500" /></div>
          {activities.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">{activities.map(activity => <ActivityPreview key={activity.id} activity={activity} />)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center"><CalendarDays className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm font-bold text-slate-600">Aucune activité publiée pour le moment</p><p className="mt-1 text-sm text-slate-400">Les nouvelles activités apparaîtront automatiquement dans votre espace.</p></div>}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-brand-900">Actions recommandées</h2><p className="mt-1 text-sm text-slate-500">Des façons simples de participer.</p></div><Lightbulb className="text-sun-500" /></div>
          <div className="mt-5 grid gap-3 md:grid-cols-3"><Recommendation icon={<Lightbulb />} title="Proposer une idée" onClick={() => openContributionForm('Idée')} /><Recommendation icon={<UsersIcon />} title="Découvrir nos axes" href="/axes" /><Recommendation icon={<Activity />} title="Voir les activités" href="#activites" /></div>
        </section>
      </main>
    </div>
    <MobileBottomNav />
  </div>;
}

function MemberContributionForm({ member, initialType, onClose, onSubmitted }: { member: Member; initialType: 'Besoin' | 'Idée'; onClose: () => void; onSubmitted: () => void }) {
  const [type, setType] = useState(initialType);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
          author: `${member.firstName} ${member.lastName}`,
          phone: member.phone,
          neighborhood: member.neighborhood,
          title: formData.get('title'),
          description,
          type,
          image,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Impossible d’enregistrer votre contribution.');
        return;
      }
      setSubmitted(true);
      onSubmitted();
    } catch {
      setError('Une erreur réseau est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
      setError('Veuillez sélectionner une image valide.');
      return;
    }
    if (file.size > 1_500_000) {
      setError('L’image est trop volumineuse. La taille maximale est de 1,5 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setImageName(file.name);
        setError('');
      }
    };
    reader.onerror = () => setError('Impossible de lire cette image. Réessayez avec un autre fichier.');
    reader.readAsDataURL(file);
  }

  return <section id="nouvelle-contribution" className="mb-6 scroll-mt-6 rounded-3xl border border-brand-200 bg-white p-6 shadow-card">
    <div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-brand-600">Votre contribution</p><h2 className="mt-2 text-2xl font-extrabold text-brand-900">Partager une contribution</h2><p className="mt-1 text-sm text-slate-500">Elle sera envoyée à l’équipe pour approbation.</p></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer le formulaire"><X size={19} /></button></div>
    {submitted ? <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-brand-700"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white"><Check size={20} /></div><h3 className="mt-4 text-lg font-extrabold">Contribution envoyée.</h3><p className="mt-1 text-sm leading-6">L’équipe va l’examiner. Vous pourrez suivre son statut dans « Mes contributions ».</p><button onClick={onClose} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-3 text-sm font-bold text-white">Fermer <ArrowUpRight size={15} /></button></div> : <form onSubmit={submit} className="mt-6 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Type *</span><select value={type} onChange={event => setType(event.target.value as 'Besoin' | 'Idée')} className="input-focus"><option value="Besoin">Besoin à signaler</option><option value="Idée">Idée à proposer</option></select></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Titre *</span><input name="title" required maxLength={200} className="input-focus" placeholder={type === 'Besoin' ? 'Ex. Éclairage public rue 14' : 'Ex. Atelier de formation numérique'} /></label></div><div className="grid gap-4 sm:grid-cols-3"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Nom</span><input value={`${member.firstName} ${member.lastName}`} readOnly className="input-focus bg-slate-50" /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Quartier</span><input value={member.neighborhood} readOnly className="input-focus bg-slate-50" /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Téléphone</span><input value={member.phone} readOnly className="input-focus bg-slate-50" /></label></div><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Description *</span><textarea required value={description} onChange={event => setDescription(event.target.value)} maxLength={5000} rows={5} className="input-focus resize-none" placeholder={type === 'Besoin' ? 'Décrivez le problème observé dans votre quartier.' : 'Décrivez votre proposition pour le quartier.'} /></label><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-brand-400 hover:bg-brand-50"><ImagePlus size={18} className="text-brand-500" /><span className="min-w-0 flex-1 truncate">{imageName || 'Joindre une image'}</span><span className="text-xs font-normal text-slate-400">Optionnel · 1,5 Mo max</span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImage} className="sr-only" /></label>{image && <Image src={image} alt="Aperçu de la contribution" width={600} height={128} unoptimized className="h-32 w-full rounded-2xl object-cover" />}{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="btn-secondary">Annuler</button><button disabled={loading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Envoi…' : 'Envoyer la contribution'} {!loading && <Send size={16} />}</button></div></form>}
  </section>;
}

function ContributionSection({ id, title, description, contributions, emptyTitle, emptyActionLabel, onCreate, className = '', ideaSection = false }: { id: string; title: string; description: string; contributions: MemberContribution[]; emptyTitle: string; emptyActionLabel: string; onCreate: () => void; className?: string; ideaSection?: boolean }) {
  const EmptyIcon = ideaSection ? Lightbulb : FileText;

  return <section id={id} className={`${className} scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card`}>
    <div className="flex items-center justify-between gap-4">
      <div><div className="flex items-center gap-2"><h2 className="text-xl font-extrabold text-brand-900">{title}</h2><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-600">{contributions.length}</span></div><p className="mt-1 text-sm text-slate-500">{description}</p></div>
      <button onClick={onCreate} className="shrink-0 rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label={ideaSection ? 'Créer une idée' : 'Créer une contribution'}><Plus size={17} /></button>
    </div>
    {contributions.length ? <div className="mt-6 divide-y divide-slate-100">{contributions.map(item => <ContributionRow key={item.id} item={item} />)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-6 text-center"><EmptyIcon className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm font-bold text-slate-600">{emptyTitle}</p><button onClick={onCreate} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-brand-600">{emptyActionLabel} <ArrowUpRight size={15} /></button></div>}
  </section>;
}

function ContributionRow({ item }: { item: MemberContribution }) {
  return <div className="py-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><p className="truncate font-bold text-brand-900">{item.title}</p>{item.image && <Image src={item.image} alt="" width={36} height={36} unoptimized className="h-9 w-9 shrink-0 rounded-lg object-cover" />}</div><span className="whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-brand-600">{item.status}</span></div><p className="mt-2 text-xs text-slate-400">{item.type} · {formatContributionDate(item.createdAt)}</p></div>;
}

function formatContributionDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date non disponible';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function DashboardTop({ member, onLogout, notifications }: { member: Member; onLogout: () => void; notifications: MemberNotification[] }) { return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-5"><Link href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-sm font-black text-white">JA</Link><div className="flex min-w-0 items-center gap-2 sm:gap-3"><span className="min-w-0 truncate text-xs font-extrabold text-brand-900 sm:text-sm">{member.firstName} {member.lastName}</span><MemberNotifications notifications={notifications} /><button onClick={onLogout} className="flex shrink-0 items-center gap-1.5 border-l border-slate-200 pl-2.5 text-xs font-bold text-slate-500 sm:gap-2 sm:pl-3 sm:text-sm"><LogOut size={15} /> Quitter</button></div></div></header>; }
function MemberNotifications({ notifications: initialNotifications }: { notifications: MemberNotification[] }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter(notification => !notification.read).length;

  useEffect(() => {
    const refresh = async () => {
      const response = await fetch('/api/members/notifications', { cache: 'no-store' }).catch(() => null);
      if (response?.ok) {
        const nextNotifications = await response.json().catch(() => null);
        if (Array.isArray(nextNotifications)) setNotifications(nextNotifications);
      }
    };
    const interval = window.setInterval(refresh, 30000);
    return () => window.clearInterval(interval);
  }, []);

  async function openNotifications() {
    setOpen(value => !value);
    if (unreadCount) {
      const response = await fetch('/api/members/notifications', { method: 'POST' }).catch(() => null);
      if (response?.ok) setNotifications(items => items.map(item => ({ ...item, read: true })));
    }
  }

  return <div className="relative"><button onClick={openNotifications} className="relative rounded-xl p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600" aria-label="Afficher les notifications" aria-expanded={open}><Bell size={18} />{unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sun-500 px-1 text-[9px] font-black text-brand-950 ring-2 ring-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>{open && <div className="fixed inset-x-4 top-20 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white text-brand-900 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[380px]"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><p className="font-extrabold">Notifications</p><p className="text-xs text-slate-400">Les nouvelles activités du mouvement</p></div><button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer les notifications"><X size={17} /></button></div><div className="max-h-80 overflow-y-auto">{notifications.length ? notifications.map(notification => <div key={notification.id} className="flex gap-3 border-b border-slate-100 p-4 last:border-0"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sun-500" /><div><p className="text-sm font-bold">{notification.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{notification.message}</p><p className="mt-1 text-[11px] text-slate-400">{formatRelativeDate(notification.createdAt)}</p></div></div>) : <p className="p-5 text-sm text-slate-500">Aucune notification pour le moment.</p>}</div></div>}</div>;
}
function DashboardSide({ onLogout }: { onLogout: () => void }) { return <aside className="hidden lg:block"><div className="sticky top-7 rounded-3xl border border-slate-200 bg-white p-3 shadow-card"><div className="px-3 pb-3 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Menu principal</div><nav className="space-y-1"><SideLink active icon={<Home size={17} />} label="Accueil" href="/espace-membre" /><SideLink icon={<FileText size={17} />} label="Mes contributions" href="#mes-contributions" /><SideLink icon={<Lightbulb size={17} />} label="Mes idées" href="#mes-idees" /><SideLink icon={<Activity size={17} />} label="Les activités" href="#activites" /></nav><div className="my-4 h-px bg-slate-100" /><button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50"><LogOut size={17} /> Quitter l’espace</button><Link href="/" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50"><Settings size={17} /> Accueil du site</Link></div></aside>; }
function SideLink({ active = false, icon, label, href }: { active?: boolean; icon: React.ReactNode; label: string; href: string }) { return <Link href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/15' : 'text-slate-500 hover:bg-brand-50 hover:text-brand-700'}`}>{icon} {label}</Link>; }
function MemberStat({ label, value, change, icon }: { label: string; value: string; change: string; icon: React.ReactNode }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-500">{label}</p><span className="rounded-xl bg-brand-50 p-2.5 text-brand-600">{icon}</span></div><p className="mt-4 text-3xl font-extrabold text-brand-900">{value}</p><p className="mt-1 text-xs font-bold text-slate-400">{change}</p></div>; }
function Recommendation({ icon, title, href, onClick }: { icon: React.ReactNode; title: string; href?: string; onClick?: () => void }) { const className = 'flex items-center gap-3 rounded-2xl border border-slate-100 p-4 text-left transition hover:border-brand-200 hover:bg-brand-50'; const content = <><span className="rounded-xl bg-sun-50 p-2.5 text-sun-600">{icon}</span><span className="flex-1 text-sm font-bold text-brand-900">{title}</span><ArrowUpRight size={15} className="text-slate-300" /></>; return onClick ? <button onClick={onClick} className={`w-full ${className}`}>{content}</button> : <Link href={href ?? '#'} className={className}>{content}</Link>; }
function ActivityPreview({ activity, dark = false }: { activity: MemberActivity; dark?: boolean }) { if (activity.kind === "gallery") return <div className={`flex items-center gap-3 rounded-2xl p-3 ${dark ? "border border-white/10 bg-white/5" : "border border-slate-100 bg-[#fbfcfb]"}`}><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${dark ? "bg-sun-500 text-brand-950" : "bg-brand-100 text-brand-600"}`}><Activity size={18} /></div><div className="min-w-0 flex-1"><p className={`truncate text-sm font-extrabold ${dark ? "text-white" : "text-brand-900"}`}>{activity.title}</p><p className={`mt-1 text-xs ${dark ? "text-white/55" : "text-slate-400"}`}>{activity.category} · {activity.date}</p></div><ChevronRight size={15} className={dark ? "text-sun-400" : "text-slate-300"} /></div>; return <div className={`flex items-center gap-3 rounded-2xl p-3 ${dark ? "border border-white/10 bg-white/5" : "border border-slate-100 bg-[#fbfcfb]"}`}><div className={`min-w-12 rounded-xl p-2 text-center ${dark ? "bg-sun-500 text-brand-950" : "bg-brand-100 text-brand-900"}`}><p className="text-[9px] font-extrabold uppercase">{activity.weekday}</p><p className="text-xl font-extrabold leading-none">{activity.day}</p></div><div className="min-w-0 flex-1"><p className={`truncate text-sm font-extrabold ${dark ? "text-white" : "text-brand-900"}`}>{activity.title}</p><p className={`mt-1 flex flex-wrap gap-2 text-xs ${dark ? "text-white/55" : "text-slate-400"}`}><span className="flex items-center gap-1"><Clock3 size={11} /> {activity.time}</span><span className="flex items-center gap-1"><MapPin size={11} /> {activity.place}</span></p></div><ChevronRight size={15} className={dark ? "text-sun-400" : "text-slate-300"} /></div>; }
function UsersIcon() { return <Users size={17} />; }
