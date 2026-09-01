'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, FileText, Plus, Search, Users } from 'lucide-react';
import {
  AdminSidebar,
  AdminTopbar,
  DashboardEvent,
  DashboardMember,
  DashboardNotification,
  Contribution,
  NotificationsPanel,
  SettingsModal,
  Status,
  formatRelativeDate,
} from '@/components/admin-dashboard';

type ListKind = 'contributions' | 'membres' | 'activites';

const pageConfig = {
  contributions: {
    section: 'contributions',
    eyebrow: 'Contributions',
    title: 'Toutes les contributions',
    description: 'Consultez et suivez les besoins et les idées envoyés par les habitants.',
    empty: 'Aucune contribution enregistrée.',
  },
  membres: {
    section: 'membres',
    eyebrow: 'Membres',
    title: 'Tous les membres',
    description: 'Retrouvez les adhésions enregistrées par le mouvement.',
    empty: 'Aucune adhésion enregistrée.',
  },
  activites: {
    section: 'activites',
    eyebrow: 'Activités terrain',
    title: 'Toutes les activités',
    description: 'Gérez les événements publiés dans l’agenda de la page d’accueil.',
    empty: 'Aucune activité publiée.',
  },
} as const;

export function AdminListPage({ kind }: { kind: ListKind }) {
  const config = pageConfig[kind];
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [members, setMembers] = useState<DashboardMember[]>([]);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [memberAlerts, setMemberAlerts] = useState(true);
  const pageSize = 8;

  async function refresh() {
    const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    setContributions(data.contributions ?? []);
    setMembers(data.members ?? []);
    setEvents(data.events ?? []);
    setNotifications(data.notifications ?? []);
  }

  useEffect(() => {
    refresh();
    if (!autoRefresh) return;
    const interval = window.setInterval(refresh, 10000);
    return () => window.clearInterval(interval);
  }, [autoRefresh]);

  const filteredContributions = useMemo(() => contributions.filter(item => `${item.title} ${item.author} ${item.neighborhood}`.toLowerCase().includes(query.toLowerCase())), [contributions, query]);
  const filteredMembers = useMemo(() => members.filter(item => `${item.firstName} ${item.lastName} ${item.email} ${item.neighborhood}`.toLowerCase().includes(query.toLowerCase())), [members, query]);
  const filteredEvents = useMemo(() => events.filter(item => `${item.title} ${item.place} ${item.weekday}`.toLowerCase().includes(query.toLowerCase())), [events, query]);
  const totalItems = kind === 'contributions' ? filteredContributions.length : kind === 'membres' ? filteredMembers.length : filteredEvents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  useEffect(() => setPage(1), [kind, query]);

  const unreadCount = notifications.filter(notification => !notification.read && (memberAlerts || notification.type !== 'member')).length;

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/login/admin');
    router.refresh();
  }

  async function markNotificationsRead() {
    setNotifications(items => items.map(item => ({ ...item, read: true })));
    await fetch('/api/admin/notifications', { method: 'POST' });
  }

  const visibleContributions = filteredContributions.slice(start, start + pageSize);
  const visibleMembers = filteredMembers.slice(start, start + pageSize);
  const visibleEvents = filteredEvents.slice(start, start + pageSize);

  return <div className="min-h-screen bg-[#f4f7f3] pt-[68px] text-brand-900 sm:pt-[76px]">
    <AdminTopbar unreadCount={unreadCount} onMenu={() => setMenuOpen(true)} onNotifications={() => { setNotificationsOpen(value => !value); if (unreadCount) markNotificationsRead(); }} />
    {notificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setNotificationsOpen(false)} />}
    <div className="mx-auto flex max-w-[1540px] gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <AdminSidebar activeSection={config.section} onNavigate={() => undefined} onSettings={() => setSettingsOpen(true)} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />
      <main className="min-w-0 flex-1 lg:ml-[264px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow text-brand-600">{config.eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{config.title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">{config.description}</p></div>
          <div className="flex flex-wrap gap-2">
            {kind === 'activites' && <Link href="/admin" className="btn-primary !rounded-xl !bg-brand-900"><Plus size={17} /> Nouvelle activité</Link>}
            <Link href="/admin" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold shadow-sm transition hover:border-brand-300 hover:bg-brand-50"><ArrowUpRight size={16} /> Vue d’ensemble</Link>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-sm font-bold text-slate-500">{totalItems} élément{totalItems > 1 ? 's' : ''}</p><p className="mt-1 text-xs text-slate-400">La liste se met à jour automatiquement.</p></div><label className="relative block w-full sm:max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Rechercher ${kind === 'contributions' ? 'une contribution' : kind === 'membres' ? 'un membre' : 'une activité'}`} className="input-focus !min-h-11 !rounded-xl !py-2.5 !pl-10" /></label></div>
          {kind === 'contributions' && <ContributionList items={visibleContributions} empty={config.empty} />}
          {kind === 'membres' && <MemberList items={visibleMembers} empty={config.empty} />}
          {kind === 'activites' && <EventList items={visibleEvents} empty={config.empty} />}
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </section>
      </main>
    </div>
    {settingsOpen && <SettingsModal autoRefresh={autoRefresh} memberAlerts={memberAlerts} onClose={() => setSettingsOpen(false)} onSave={(nextAutoRefresh, nextMemberAlerts) => { setAutoRefresh(nextAutoRefresh); setMemberAlerts(nextMemberAlerts); setSettingsOpen(false); }} />}
  </div>;
}

function ContributionList({ items, empty }: { items: Contribution[]; empty: string }) {
  if (!items.length) return <EmptyList icon={<FileText />} message={empty} />;
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[.16em] text-slate-400"><tr><th className="px-6 py-3 font-extrabold">Contribution</th><th className="px-4 py-3 font-extrabold">Type</th><th className="px-4 py-3 font-extrabold">Statut</th><th className="px-4 py-3 font-extrabold">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map(item => <tr key={item.id} className="transition hover:bg-brand-50/40"><td className="px-6 py-4"><p className="font-bold">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.author} · {item.neighborhood}</p><p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">{item.description}</p></td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{item.type}</span></td><td className="px-4 py-4"><Status status={item.status} /></td><td className="px-4 py-4 text-xs text-slate-500">{formatRelativeDate(item.createdAt)}</td></tr>)}</tbody></table></div>;
}

function MemberList({ items, empty }: { items: DashboardMember[]; empty: string }) {
  if (!items.length) return <EmptyList icon={<Users />} message={empty} />;
  return <div className="divide-y divide-slate-100">{items.map(item => <div key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-black text-brand-600">{item.firstName.charAt(0)}{item.lastName.charAt(0)}</span><div><p className="font-bold">{item.firstName} {item.lastName}</p><p className="mt-1 text-xs text-slate-400">{item.email} · {item.phone}</p></div></div><div className="text-left text-xs text-slate-500 sm:text-right"><p>{item.neighborhood}</p><p className="mt-1 font-bold text-brand-500">{formatRelativeDate(item.createdAt)}</p></div></div>)}</div>;
}

function EventList({ items, empty }: { items: DashboardEvent[]; empty: string }) {
  if (!items.length) return <EmptyList icon={<CalendarDays />} message={empty} />;
  return <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">{items.map(item => <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-extrabold uppercase text-brand-600"><span className="rounded-lg bg-sun-100 px-2 py-1 text-sun-700">{item.weekday} {item.day}</span><span>{item.time}</span></div><h2 className="mt-3 font-extrabold">{item.title}</h2><p className="mt-1 text-sm text-slate-500">{item.place}</p>{item.featured && <span className="mt-3 inline-flex rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-brand-600">En avant</span>}</article>)}</div>;
}

function EmptyList({ icon, message }: { icon: React.ReactNode; message: string }) { return <div className="p-10 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">{icon}</span><p className="mt-3 text-sm text-slate-500">{message}</p></div>; }

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6"><button disabled={page === 1} onClick={() => onChange(page - 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} /> Précédent</button><p className="text-xs font-bold text-slate-500">Page {page} sur {totalPages}</p><button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40">Suivant <ChevronRight size={15} /></button></div>;
}
