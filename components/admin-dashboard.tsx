'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, ArrowUpRight, Bell, CheckCircle2, ChevronRight, FileText,
  LayoutDashboard, Lightbulb, LogOut, Menu, MoreHorizontal, Plus,
  Search, Settings, Users, X,
} from 'lucide-react';

export type ContributionStatus = 'Nouveau' | 'En étude' | 'En cours' | 'Résolu';
export type ContributionType = 'Besoin' | 'Idée';
export type Contribution = { id: string; title: string; author: string; neighborhood: string; type: ContributionType; status: ContributionStatus; description: string; phone: string; createdAt: string };
export type DashboardEvent = { id: string; day: string; weekday: string; title: string; time: string; place: string; featured?: boolean; createdAt: string };
export type DashboardMember = { id: string; firstName: string; lastName: string; email: string; neighborhood: string; phone: string; createdAt: string };
export type DashboardNotification = { id: string; type: 'member' | 'event' | 'contribution'; title: string; message: string; createdAt: string; read: boolean };

const sideLinks = [
  { label: "Vue d'ensemble", icon: LayoutDashboard, href: '/admin#top', section: 'top' },
  { label: 'Contributions', icon: FileText, href: '/admin/contributions', section: 'contributions' },
  { label: 'Membres', icon: Users, href: '/admin/membres', section: 'membres' },
  { label: 'Activités terrain', icon: Activity, href: '/admin/activites', section: 'activites' },
];

export function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<'Toutes' | ContributionType>('Toutes');
  const [query, setQuery] = useState('');
  const [eventOpen, setEventOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [flash, setFlash] = useState('');
  const [members, setMembers] = useState<DashboardMember[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<DashboardEvent[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [activeSection, setActiveSection] = useState('top');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [memberAlerts, setMemberAlerts] = useState(true);
  const router = useRouter();

  const filteredContributions = contributions.filter(contribution => {
    const search = `${contribution.title} ${contribution.author} ${contribution.neighborhood}`.toLowerCase();
    return (filter === 'Toutes' || contribution.type === filter) && search.includes(query.toLowerCase());
  });
  const pendingCount = contributions.filter(contribution => contribution.status !== 'Résolu').length;
  const resolvedRate = contributions.length ? Math.round((contributions.filter(contribution => contribution.status === 'Résolu').length / contributions.length) * 100) : 0;
  const unreadCount = notifications.filter(notification => !notification.read && (memberAlerts || notification.type !== 'member')).length;

  async function refreshDashboard() {
    const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    setMembers(data.members ?? []);
    setPublishedEvents(data.events ?? []);
    setContributions(data.contributions ?? []);
    setNotifications(data.notifications ?? []);
  }

  useEffect(() => {
    refreshDashboard();
    if (!autoRefresh) return;
    const interval = window.setInterval(refreshDashboard, 10000);
    return () => window.clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    const sections = sideLinks.map(link => document.querySelector(`#${link.section}`)).filter(Boolean) as Element[];
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-90px 0px -55% 0px', threshold: [0.1, 0.4, 0.7] });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/login/admin');
    router.refresh();
  }

  async function markNotificationsRead() {
    setNotifications(current => current.map(notification => ({ ...notification, read: true })));
    await fetch('/api/admin/notifications', { method: 'POST' });
  }

  function exportReport() {
    const rows = [
      ['Type', 'Titre', 'Auteur / lieu', 'Statut / date'],
      ...contributions.map(item => ['Contribution', item.title, `${item.author} · ${item.neighborhood}`, `${item.status} · ${formatRelativeDate(item.createdAt)}`]),
      ...publishedEvents.map(item => ['Événement', item.title, item.place, `${item.day} ${item.weekday} · ${item.time}`]),
      ...members.map(item => ['Membre', `${item.firstName} ${item.lastName}`, `${item.email} · ${item.neighborhood}`, new Date(item.createdAt).toLocaleDateString('fr-FR')]),
    ];
    const csv = rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-jamm-ak-xeewal-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setFlash('Le rapport a été téléchargé.');
  }

  async function publishEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: formData.get('date'),
        title: formData.get('title'),
        time: formData.get('time'),
        place: formData.get('place'),
        featured: formData.get('featured') === 'on',
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setFlash(data?.error ?? 'Impossible de publier cet événement.');
      return;
    }
    setEventOpen(false);
    setFlash('L’événement est publié et visible sur la page d’accueil.');
    await refreshDashboard();
  }

  return <div id="top" className="min-h-screen bg-[#f4f7f3] pt-[68px] text-brand-900 sm:pt-[76px]">
    <AdminTopbar unreadCount={unreadCount} onMenu={() => setMenuOpen(true)} onNotifications={() => { setNotificationsOpen(current => !current); if (unreadCount) markNotificationsRead(); }} />
    {notificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setNotificationsOpen(false)} />}
    <div className="mx-auto flex max-w-[1540px] gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <AdminSidebar activeSection={activeSection} onNavigate={setActiveSection} onSettings={() => { setActiveSection('parametres'); setSettingsOpen(true); }} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />
      <main className="min-w-0 flex-1 lg:ml-[264px]">
        {eventOpen ? <NewEventPage onClose={() => setEventOpen(false)} onSubmit={publishEvent} /> : <>
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow text-brand-600">{formatTodayDate()} · Thiès-Nord</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Bonjour administrateur.</h1><p className="mt-2 text-sm text-slate-500 sm:text-base">Voici ce qui mérite votre attention aujourd’hui.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row"><button onClick={exportReport} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold shadow-sm transition hover:border-brand-300 hover:bg-brand-50"><ArrowUpRight size={16} /> Exporter le rapport</button><button onClick={() => setEventOpen(true)} className="btn-primary !rounded-xl !bg-brand-900"><Plus size={17} /> Nouvelle activité</button></div>
        </div>
        {flash && <div className="mb-5 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700"><span>{flash}</span><button onClick={() => setFlash('')} aria-label="Fermer le message"><X size={16} /></button></div>}

        <AdminStats memberCount={members.length} contributionCount={contributions.length} eventCount={publishedEvents.length} pendingCount={pendingCount} responseRate={resolvedRate} />

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.7fr)]">
          <section id="contributions" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-100 p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-extrabold">Contributions récentes</h2><span className="rounded-full bg-sun-50 px-2.5 py-1 text-[11px] font-extrabold text-sun-700">{contributions.filter(contribution => contribution.status !== 'Résolu').length} à traiter</span></div><p className="mt-1 text-sm text-slate-500">Les dernières remontées des habitants.</p></div><a href="#contributions" className="inline-flex items-center gap-1 text-sm font-bold text-brand-600">Voir tout <ChevronRight size={15} /></a></div><div className="mt-5 flex flex-col gap-3 md:flex-row"><label className="relative min-w-0 flex-1"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher une contribution" className="input-focus !min-h-11 !rounded-xl !py-2.5 !pl-10" /></label><div className="flex shrink-0 rounded-xl bg-slate-100 p-1">{(['Toutes', 'Besoin', 'Idée'] as const).map(item => <button key={item} onClick={() => setFilter(item)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-extrabold transition md:flex-none ${filter === item ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-brand-900'}`}>{item}</button>)}</div></div></div>
            <div className="divide-y divide-slate-100 md:hidden">{filteredContributions.map(contribution => <ContributionCard key={contribution.title} contribution={contribution} onAction={() => setFlash(`Options ouvertes pour « ${contribution.title} »`)} />)}{!filteredContributions.length && <EmptyState />}</div>
            <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[.16em] text-slate-400"><tr><th className="px-6 py-3 font-extrabold">Contribution</th><th className="px-4 py-3 font-extrabold">Type</th><th className="px-4 py-3 font-extrabold">Statut</th><th className="px-4 py-3 font-extrabold">Date</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{filteredContributions.map(contribution => <ContributionRow key={contribution.title} contribution={contribution} onAction={() => setFlash(`Options ouvertes pour « ${contribution.title} »`)} />)}</tbody></table>{!filteredContributions.length && <EmptyState />}</div>
          </section>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1"><section className="rounded-3xl bg-brand-900 p-5 text-white shadow-soft sm:p-6"><div className="flex items-start justify-between"><div><p className="eyebrow text-sun-400">File de traitement</p><p className="mt-3 text-4xl font-black">{pendingCount}</p><p className="mt-1 text-sm text-white/55">contributions en attente</p></div><span className="rounded-2xl bg-sun-500/15 p-3 text-sun-400"><Bell size={21} /></span></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sun-500" style={{ width: `${contributions.length ? (pendingCount / contributions.length) * 100 : 0}%` }} /></div><div className="mt-2 flex justify-between text-xs text-white/45"><span>À traiter</span><span>{contributions.length ? `${pendingCount} / ${contributions.length}` : '0'}</span></div><a href="#contributions" className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold transition hover:bg-brand-500">Ouvrir la file <ArrowUpRight size={15} /></a></section><RecentActivity notifications={notifications} onAction={() => setNotificationsOpen(true)} /></div>
        </div>

        <section id="activites" className="mt-5 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow text-brand-600">Activités terrain</p><h2 className="mt-2 text-xl font-extrabold">Événements publiés</h2><p className="mt-1 text-sm text-slate-500">Ils apparaissent automatiquement dans l’agenda de l’accueil.</p></div><button onClick={() => setEventOpen(true)} className="rounded-xl bg-brand-50 p-2.5 text-brand-600 transition hover:bg-brand-100" aria-label="Ajouter un événement"><Plus size={19} /></button></div>{publishedEvents.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{publishedEvents.map(event => <div key={event.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-extrabold uppercase text-brand-600"><span className="rounded-lg bg-sun-100 px-2 py-1 text-sun-700">{event.weekday} {event.day}</span><span>{event.time}</span></div><p className="mt-3 font-extrabold">{event.title}</p><p className="mt-1 text-sm text-slate-500">{event.place}</p></div>)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">Aucun nouvel événement publié pour le moment.</p>}</section>

        <section id="membres" className="mt-5 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow text-brand-600">Membres</p><h2 className="mt-2 text-xl font-extrabold">Dernières adhésions</h2><p className="mt-1 text-sm text-slate-500">Les nouvelles adhésions sont signalées automatiquement.</p></div><Users className="text-brand-500" /></div>{members.length ? <div className="mt-5 divide-y divide-slate-100">{members.slice(0, 5).map(member => <div key={member.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{member.firstName} {member.lastName}</p><p className="text-xs text-slate-400">{member.email} · {member.neighborhood}</p></div><span className="text-xs font-bold text-brand-500">{formatRelativeDate(member.createdAt)}</span></div>)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">Aucune nouvelle adhésion depuis la mise en place des notifications.</p>}</section>

        <section id="parametres" className="mt-5 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow text-brand-600">Pilotage mensuel</p><h2 className="mt-2 text-xl font-extrabold">Les priorités du mouvement</h2></div><button onClick={() => setSettingsOpen(true)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Ouvrir les paramètres"><Settings size={19} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Priority icon={<Lightbulb />} title="Idées à qualifier" value={contributions.filter(contribution => contribution.type === 'Idée').length.toString()} detail="contributions reçues" tone="yellow" /><Priority icon={<Users />} title="Nouveaux membres" value={members.length.toString()} detail="adhésions enregistrées" tone="green" /><Priority icon={<Activity />} title="Actions réalisées" value={publishedEvents.length.toString()} detail="événements publiés" tone="blue" /></div></section>
        </>}
      </main>
    </div>
    {settingsOpen && <SettingsModal autoRefresh={autoRefresh} memberAlerts={memberAlerts} onClose={() => setSettingsOpen(false)} onSave={(nextAutoRefresh, nextMemberAlerts) => { setAutoRefresh(nextAutoRefresh); setMemberAlerts(nextMemberAlerts); setSettingsOpen(false); setFlash('Les paramètres ont été enregistrés.'); }} />}
  </div>;
}

export function AdminTopbar({ onMenu, onNotifications, unreadCount }: { onMenu: () => void; onNotifications: () => void; unreadCount: number }) {
  return <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white"><div className="mx-auto flex h-[68px] max-w-[1540px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button onClick={onMenu} className="rounded-xl border border-slate-200 p-2.5 text-brand-900 lg:hidden" aria-label="Ouvrir le menu"><Menu size={19} /></button><Link href="/admin" className="flex shrink-0 items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-sm font-black text-white">JA</span><span className="hidden border-l border-slate-200 pl-3 text-sm font-extrabold sm:block">Administration</span></Link></div><div className="flex items-center gap-2 sm:gap-3"><div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 md:flex"><Search size={16} /><span>Rechercher</span><kbd className="rounded bg-white px-1.5 py-0.5 text-[10px]">⌘ K</kbd></div><button onClick={onNotifications} className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-brand-300 hover:bg-brand-50" aria-label="Afficher les notifications"><Bell size={18} />{unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sun-500 px-1 text-[9px] font-black text-brand-950 ring-2 ring-white">{unreadCount}</span>}</button><div className="hidden items-center gap-3 border-l border-slate-200 pl-3 sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun-100 text-xs font-extrabold text-sun-700">AD</span><div><p className="text-xs font-bold">Administrateur</p><p className="text-[11px] text-slate-400">Compte sécurisé</p></div></div></div></div></header>;
}

export function NotificationsPanel({ notifications, onClose }: { notifications: DashboardNotification[]; onClose: () => void }) {
  return <div className="fixed right-4 top-[78px] z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><p className="font-extrabold">Notifications</p><p className="text-xs text-slate-400">Adhésions et publications récentes</p></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer les notifications"><X size={17} /></button></div><div className="max-h-80 overflow-y-auto">{notifications.length ? notifications.slice(0, 8).map(notification => <div key={notification.id} className="flex gap-3 border-b border-slate-100 p-4 last:border-0"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.type === 'member' ? 'bg-brand-500' : 'bg-sun-500'}`} /><div><p className="text-sm font-bold">{notification.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{notification.message}</p><p className="mt-1 text-[11px] text-slate-400">{formatRelativeDate(notification.createdAt)}</p></div></div>) : <p className="p-5 text-sm text-slate-500">Aucune notification pour le moment.</p>}</div></div>;
}

export function AdminSidebar({ activeSection, onNavigate, onSettings, open, onClose, onLogout }: { activeSection: string; onNavigate: (section: string) => void; onSettings: () => void; open: boolean; onClose: () => void; onLogout: () => void }) {
  return <><div onClick={onClose} className={`fixed inset-0 z-40 bg-brand-950/40 transition lg:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`} /><aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] transform flex-col overflow-hidden border-r border-slate-200 bg-white p-4 shadow-2xl transition-transform lg:inset-y-auto lg:left-[max(2rem,calc((100vw-1540px)/2+2rem))] lg:top-[92px] lg:h-[calc(100vh-108px)] lg:w-60 lg:rounded-3xl lg:border lg:p-3 lg:shadow-card ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}><div className="mb-5 flex items-center justify-between px-2 lg:hidden"><p className="font-extrabold">Menu admin</p><button onClick={onClose} className="rounded-lg p-2 text-slate-500" aria-label="Fermer le menu"><X size={19} /></button></div><div className="px-3 pb-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">Pilotage</div><nav className="space-y-1">{sideLinks.map(({ label, icon: Icon, href, section }) => <Link key={label} href={href} onClick={() => { onNavigate(section); onClose(); }} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${activeSection === section ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/15' : 'text-slate-500 hover:bg-brand-50 hover:text-brand-700'}`}><Icon size={17} /><span className="flex-1">{label}</span></Link>)}</nav><div className="mt-auto"><div className="my-5 h-px bg-slate-100" /><div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">Compte</div><button onClick={() => { onSettings(); onClose(); }} className={`mt-4 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition ${activeSection === 'parametres' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}><Settings size={17} /> Paramètres</button><button onClick={onLogout} className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-red-500 hover:bg-red-50"><LogOut size={17} /> Se déconnecter</button></div></aside></>;
}

function AdminStats({ memberCount, contributionCount, eventCount, pendingCount, responseRate }: { memberCount: number; contributionCount: number; eventCount: number; pendingCount: number; responseRate: number }) { return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={<Users />} label="Membres actifs" value={memberCount.toString()} change="données enregistrées" tone="green" /><Stat icon={<FileText />} label="Contributions" value={contributionCount.toString()} change={`${pendingCount} à traiter`} tone="yellow" /><Stat icon={<Activity />} label="Actions terrain" value={eventCount.toString()} change="événements publiés" tone="blue" /><Stat icon={<CheckCircle2 />} label="Taux de réponse" value={`${responseRate}%`} change="données disponibles" tone="green" /></div>; }
function Stat({ icon, label, value, change, tone }: { icon: React.ReactNode; label: string; value: string; change: string; tone: 'green' | 'yellow' | 'blue' }) { const colors = { green: 'bg-brand-50 text-brand-600', yellow: 'bg-sun-50 text-sun-600', blue: 'bg-blue-50 text-blue-600' }; return <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-card sm:p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold text-slate-500">{label}</p><span className={`rounded-xl p-2 ${colors[tone]}`}>{icon}</span></div><p className="mt-3 text-2xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs font-bold text-brand-500">{change}</p></div>; }
function ContributionCard({ contribution, onAction }: { contribution: Contribution; onAction: () => void }) { return <article className="p-4"><div className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sun-500" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="font-extrabold leading-5">{contribution.title}</p><Status status={contribution.status} /></div><p className="mt-1 text-xs text-slate-400">{contribution.author} · {contribution.neighborhood}</p><p className="mt-3 text-xs text-slate-400">{contribution.type} · {formatRelativeDate(contribution.createdAt)}</p></div><button onClick={onAction} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-700" aria-label={`Options pour ${contribution.title}`}><MoreHorizontal size={17} /></button></div></article>; }
function ContributionRow({ contribution, onAction }: { contribution: Contribution; onAction: () => void }) { return <tr className="transition hover:bg-brand-50/40"><td className="px-6 py-4"><p className="font-bold">{contribution.title}</p><p className="mt-1 text-xs text-slate-400">{contribution.author} · {contribution.neighborhood}</p></td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{contribution.type}</span></td><td className="px-4 py-4"><Status status={contribution.status} /></td><td className="px-4 py-4 text-xs text-slate-500">{formatRelativeDate(contribution.createdAt)}</td><td className="px-4 py-4 text-right"><button onClick={onAction} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-700" aria-label={`Options pour ${contribution.title}`}><MoreHorizontal size={17} /></button></td></tr>; }
export function Status({ status }: { status: ContributionStatus }) { const style = status === 'Résolu' ? 'bg-brand-50 text-brand-600' : status === 'Nouveau' ? 'bg-sun-50 text-sun-700' : status === 'En cours' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'; return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold ${style}`}>{status}</span>; }
function EmptyState() { return <div className="p-8 text-center text-sm text-slate-500">Aucune contribution ne correspond à votre recherche.</div>; }
function RecentActivity({ notifications, onAction }: { notifications: DashboardNotification[]; onAction: () => void }) { return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"><div className="flex items-center justify-between"><div><p className="eyebrow text-brand-600">Journal</p><h2 className="mt-2 text-xl font-extrabold">Activité récente</h2></div><button onClick={onAction} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Voir toutes les notifications"><MoreHorizontal size={19} /></button></div><div className="mt-5 space-y-5">{notifications.slice(0, 3).map(notification => <Timeline key={notification.id} color={notification.type === 'member' ? 'green' : 'yellow'} title={notification.title} detail={`${notification.message} · ${formatRelativeDate(notification.createdAt)}`} />)}{!notifications.length && <Timeline color="blue" title="Aucune nouvelle activité" detail="Les événements apparaîtront ici." />}</div></section>; }
function Timeline({ color, title, detail }: { color: 'green' | 'yellow' | 'blue'; title: string; detail: string }) { return <div className="flex gap-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color === 'green' ? 'bg-brand-500' : color === 'yellow' ? 'bg-sun-500' : 'bg-blue-500'}`} /><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div></div>; }
function Priority({ icon, title, value, detail, tone }: { icon: React.ReactNode; title: string; value: string; detail: string; tone: 'yellow' | 'green' | 'blue' }) { const colors = { yellow: 'bg-sun-50 text-sun-600', green: 'bg-brand-50 text-brand-600', blue: 'bg-blue-50 text-blue-600' }; return <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><span className={`rounded-xl p-2.5 ${colors[tone]}`}>{icon}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div><p className="text-2xl font-black">{value}</p></div>; }

function NewEventPage({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="min-h-[calc(100vh-108px)] bg-[#f4f7f3] py-2 text-brand-900 sm:py-4"><div className="mx-auto max-w-3xl"><button type="button" onClick={onClose} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-brand-700"><ChevronRight size={16} className="rotate-180" /> Retour au dashboard</button><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-10"><div className="border-b border-slate-100 pb-6"><p className="eyebrow text-brand-600">Activités terrain</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Publier une nouvelle activité</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Complétez les informations ci-dessous. L’activité sera visible immédiatement dans l’agenda de la page d’accueil.</p></div><form onSubmit={onSubmit} className="mt-8 space-y-5"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Titre *</span><input name="title" required className="input-focus" placeholder="Causerie citoyenne" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Date *</span><input name="date" required type="date" className="input-focus" /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Horaire *</span><input name="time" required className="input-focus" placeholder="16h00 — 18h00" /></label></div><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Lieu *</span><input name="place" required className="input-focus" placeholder="Quartier Nguinth" /></label><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-600"><input name="featured" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Mettre cet événement en avant sur l’agenda</label><div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="btn-secondary">Annuler</button><button className="btn-primary"><Plus size={16} /> Publier l’activité</button></div></form></div></div></div>;
}

export function SettingsModal({ autoRefresh, memberAlerts, onClose, onSave }: { autoRefresh: boolean; memberAlerts: boolean; onClose: () => void; onSave: (autoRefresh: boolean, memberAlerts: boolean) => void }) {
  const [nextAutoRefresh, setNextAutoRefresh] = useState(autoRefresh);
  const [nextMemberAlerts, setNextMemberAlerts] = useState(memberAlerts);
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-950/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-brand-600">Compte administrateur</p><h2 className="mt-2 text-2xl font-extrabold">Paramètres</h2><p className="mt-1 text-sm text-slate-500">Personnalisez le suivi de votre tableau de bord.</p></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Fermer les paramètres"><X size={19} /></button></div><form onSubmit={event => { event.preventDefault(); onSave(nextAutoRefresh, nextMemberAlerts); }} className="mt-6 space-y-3"><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50"><input checked={nextMemberAlerts} onChange={event => setNextMemberAlerts(event.target.checked)} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" /><span><strong className="block text-sm">Alertes de nouvelles adhésions</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Afficher une alerte dans la cloche lorsqu’un membre rejoint le mouvement.</span></span></label><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50"><input checked={nextAutoRefresh} onChange={event => setNextAutoRefresh(event.target.checked)} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" /><span><strong className="block text-sm">Actualisation automatique</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Rechercher les nouvelles données du dashboard toutes les 10 secondes.</span></span></label><div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="btn-secondary">Annuler</button><button className="btn-primary"><CheckCircle2 size={16} /> Enregistrer</button></div></form></div></div>;
}

export function formatRelativeDate(value: string) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  return new Date(value).toLocaleDateString('fr-FR');
}

function formatTodayDate() {
  const value = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  return value.charAt(0).toUpperCase() + value.slice(1);
}
