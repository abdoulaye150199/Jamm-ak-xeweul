'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Eye, FileText, Plus, Search, Trash2, Users } from 'lucide-react';
import {
  AdminSidebar,
  AdminTopbar,
  NotificationsPanel,
  SettingsModal,
  Status,
} from '@/components/admin-dashboard';
import type { Contribution, DashboardEvent, DashboardMember, DashboardNotification } from '@/components/admin/types';
import { EventFormPage } from '@/components/admin/event-form';
import { EventCard } from '@/components/admin/event-card';
import { DeleteEventDialog } from '@/components/admin/event-dialog';
import { formatRelativeDate } from '@/lib/format';
import { DeleteMemberDialog, MemberDetailsDialog } from '@/components/admin/member-dialogs';

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
  const [loadError, setLoadError] = useState('');
  const [eventOpen, setEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DashboardEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<DashboardEvent | null>(null);
  const [flash, setFlash] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [viewingMember, setViewingMember] = useState<DashboardMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<DashboardMember | null>(null);
  const [memberDeletionBusy, setMemberDeletionBusy] = useState(false);
  const [memberDeletionError, setMemberDeletionError] = useState('');
  const pageSize = 8;

  const refresh = useCallback(async () => {
    try {
      const section = kind === 'membres' ? 'members' : kind === 'activites' ? 'events' : 'contributions';
      const response = await fetch(`/api/admin/dashboard?section=${section}&page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(query)}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('dashboard request failed');
      const data = await response.json();
      if (kind === 'contributions') setContributions(data.items ?? []);
      if (kind === 'membres') setMembers(data.items ?? []);
      if (kind === 'activites') setEvents(data.items ?? []);
      setTotalItems(data.total ?? 0);
      const lastPage = Math.max(1, Math.ceil((data.total ?? 0) / pageSize));
      if (page > lastPage) setPage(lastPage);
      setNotifications(data.notifications ?? []);
      setLoadError('');
    } catch {
      setLoadError('Les données sont momentanément indisponibles.');
    }
  }, [kind, page, query]);

  useEffect(() => {
    refresh();
    if (!autoRefresh) return;
    const interval = window.setInterval(refresh, 10000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, refresh]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => setPage(1), [kind, query]);

  const unreadCount = notifications.filter(notification => !notification.read && (memberAlerts || notification.type !== 'member')).length;

  async function logout() {
    const response = await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    if (!response?.ok) { setFlash('Impossible de vous déconnecter. Réessayez.'); return; }
    router.push('/login/admin');
    router.refresh();
  }

  async function markNotificationsRead() {
    const response = await fetch('/api/admin/notifications', { method: 'POST' }).catch(() => null);
    if (response?.ok) setNotifications(items => items.map(item => ({ ...item, read: true })));
  }

  function openEventForm(event: DashboardEvent | null = null) {
    setEditingEvent(event);
    setFlash('');
    setEventOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function eventSaved() {
    setFlash(editingEvent ? 'L’activité a été modifiée dans les agendas.' : 'L’activité est publiée et visible dans les agendas.');
    setEventOpen(false);
    setEditingEvent(null);
    await refresh();
  }

  async function eventDeleted() {
    setDeletingEvent(null);
    setFlash('L’activité a été supprimée des agendas.');
    await refresh();
  }

  async function approveContribution(id: string) {
    setApprovingId(id);
    const response = await fetch(`/api/admin/contributions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'En étude' }),
    }).catch(() => null);
    if (!response?.ok) {
      const data = await response?.json().catch(() => null);
      setFlash(data?.error ?? 'Impossible d’approuver cette contribution.');
      setApprovingId(null);
      return;
    }
    setFlash('La contribution est approuvée et passe en étude.');
    setApprovingId(null);
    await refresh();
  }

  function openMemberDeletion(member: DashboardMember) {
    setViewingMember(null);
    setMemberDeletionError('');
    setDeletingMember(member);
  }

  async function confirmMemberDeletion() {
    if (!deletingMember || memberDeletionBusy) return;
    setMemberDeletionBusy(true);
    setMemberDeletionError('');
    try {
      const response = await fetch(`/api/admin/members/${deletingMember.id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => null);
      if (!response.ok && response.status !== 404) throw new Error(data?.error ?? 'Impossible de supprimer ce membre.');
      setDeletingMember(null);
      setFlash(response.status === 404 ? 'Ce membre a déjà été supprimé.' : `${deletingMember.firstName} ${deletingMember.lastName} a été supprimé. Ses contributions sont conservées.`);
      await refresh();
    } catch (reason) {
      setMemberDeletionError(reason instanceof TypeError ? 'Erreur réseau. Le résultat de la suppression n’a pas pu être confirmé. Réessayez.' : reason instanceof Error ? reason.message : 'Impossible de supprimer ce membre. Réessayez.');
    } finally {
      setMemberDeletionBusy(false);
    }
  }

  const visibleContributions = contributions;
  const visibleMembers = members;
  const visibleEvents = events;

  return <div className="min-h-screen bg-[#f4f7f3] pt-[68px] text-brand-900 sm:pt-[76px]">
    <AdminTopbar unreadCount={unreadCount} onMenu={() => setMenuOpen(true)} onNotifications={() => { setNotificationsOpen(value => !value); if (unreadCount) markNotificationsRead(); }} />
    {notificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setNotificationsOpen(false)} />}
    <div className="mx-auto flex max-w-[1540px] gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <AdminSidebar activeSection={config.section} onNavigate={() => undefined} onSettings={() => setSettingsOpen(true)} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />
      <main className="min-w-0 flex-1 lg:ml-[264px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow text-brand-600">{config.eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{config.title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">{config.description}</p></div>
          <div className="flex flex-wrap gap-2">
            {kind === 'activites' && !eventOpen && <button onClick={() => openEventForm()} className="btn-primary !rounded-xl !bg-brand-900"><Plus size={17} /> Nouvelle activité</button>}
            <Link href="/admin" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold shadow-sm transition hover:border-brand-300 hover:bg-brand-50"><ArrowUpRight size={16} /> Vue d’ensemble</Link>
          </div>
        </div>

        {flash && <div className="mb-5 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700"><span>{flash}</span><button onClick={() => setFlash('')} aria-label="Fermer le message">×</button></div>}
        {eventOpen ? <EventFormPage key={editingEvent?.id ?? 'new'} event={editingEvent} backLabel="Retour aux activités" onClose={() => setEventOpen(false)} onSaved={eventSaved} /> : <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-sm font-bold text-slate-500">{totalItems} élément{totalItems > 1 ? 's' : ''}</p><p className="mt-1 text-xs text-slate-400">La liste se met à jour automatiquement.</p></div><label className="relative block w-full sm:max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Rechercher ${kind === 'contributions' ? 'une contribution' : kind === 'membres' ? 'un membre' : 'une activité'}`} className="input-focus !min-h-11 !rounded-xl !py-2.5 !pl-10" /></label></div>
          {kind === 'contributions' && <ContributionList items={visibleContributions} empty={config.empty} onApprove={approveContribution} approvingId={approvingId} />}
          {kind === 'membres' && <MemberList items={visibleMembers} empty={config.empty} onDetails={setViewingMember} onDelete={openMemberDeletion} />}
          {kind === 'activites' && <EventList items={visibleEvents} empty={config.empty} onEdit={openEventForm} onDelete={setDeletingEvent} />}
          {loadError && <p role="alert" className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm font-bold text-red-600">{loadError}</p>}
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </section>}
      </main>
    </div>
    {deletingEvent && <DeleteEventDialog key={deletingEvent.id} event={deletingEvent} onClose={() => setDeletingEvent(null)} onDeleted={eventDeleted} />}
    {settingsOpen && <SettingsModal autoRefresh={autoRefresh} memberAlerts={memberAlerts} onClose={() => setSettingsOpen(false)} onSave={(nextAutoRefresh, nextMemberAlerts) => { setAutoRefresh(nextAutoRefresh); setMemberAlerts(nextMemberAlerts); setSettingsOpen(false); }} />}
    {viewingMember && <MemberDetailsDialog key={viewingMember.id} member={viewingMember} onClose={() => setViewingMember(null)} onDelete={openMemberDeletion} />}
    {deletingMember && <DeleteMemberDialog member={deletingMember} busy={memberDeletionBusy} error={memberDeletionError} onClose={() => { if (!memberDeletionBusy) setDeletingMember(null); }} onConfirm={confirmMemberDeletion} />}
  </div>;
}

function ContributionList({ items, empty, onApprove, approvingId }: { items: Contribution[]; empty: string; onApprove: (id: string) => void; approvingId: string | null }) {
  if (!items.length) return <EmptyList icon={<FileText />} message={empty} />;
  return <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[.16em] text-slate-400"><tr><th className="px-6 py-3 font-extrabold">Contribution</th><th className="px-4 py-3 font-extrabold">Type</th><th className="px-4 py-3 font-extrabold">Statut</th><th className="px-4 py-3 font-extrabold">Date</th><th className="px-4 py-3 font-extrabold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map(item => <tr key={item.id} className="transition hover:bg-brand-50/40"><td className="px-6 py-4"><p className="font-bold">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.author} · {item.neighborhood}</p><p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">{item.description}</p></td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{item.type}</span></td><td className="px-4 py-4"><Status status={item.status} /></td><td className="px-4 py-4 text-xs text-slate-500">{formatRelativeDate(item.createdAt)}</td><td className="px-4 py-4">{item.status === 'Nouveau' ? <button onClick={() => onApprove(item.id)} disabled={approvingId === item.id} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"><Check size={14} /> {approvingId === item.id ? 'Approbation…' : 'Approuver'}</button> : <span className="text-xs font-bold text-slate-400">Traitée</span>}</td></tr>)}</tbody></table></div>;
}

function MemberList({ items, empty, onDetails, onDelete }: { items: DashboardMember[]; empty: string; onDetails: (member: DashboardMember) => void; onDelete: (member: DashboardMember) => void }) {
  if (!items.length) return <EmptyList icon={<Users />} message={empty} />;
  return <div className="divide-y divide-slate-100">{items.map(item => <div key={item.id} className="flex flex-col gap-4 p-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
    <div className="flex min-w-0 items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-black text-brand-600">{item.firstName.charAt(0)}{item.lastName.charAt(0)}</span><div className="min-w-0"><p className="break-words font-bold">{item.firstName} {item.lastName}</p><p className="mt-1 break-all text-xs text-slate-400">{item.email} · {item.phone}</p><p className="mt-2 text-xs text-slate-500">{item.neighborhood} · {formatRelativeDate(item.createdAt)}</p></div></div>
    <div className="flex shrink-0 flex-wrap gap-2">
      <button type="button" onClick={() => onDetails(item)} aria-label={`Voir les détails de ${item.firstName} ${item.lastName}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50"><Eye size={15} /> Détails</button>
      <button type="button" onClick={() => onDelete(item)} aria-label={`Supprimer ${item.firstName} ${item.lastName}`} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"><Trash2 size={15} /> Supprimer</button>
    </div>
  </div>)}</div>;
}

function EventList({ items, empty, onEdit, onDelete }: { items: DashboardEvent[]; empty: string; onEdit: (event: DashboardEvent) => void; onDelete: (event: DashboardEvent) => void }) {
  if (!items.length) return <EmptyList icon={<CalendarDays />} message={empty} />;
  return <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">{items.map(event => <EventCard key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />)}</div>;
}

function EmptyList({ icon, message }: { icon: React.ReactNode; message: string }) { return <div className="p-10 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">{icon}</span><p className="mt-3 text-sm text-slate-500">{message}</p></div>; }

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6"><button disabled={page === 1} onClick={() => onChange(page - 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} /> Précédent</button><p className="text-xs font-bold text-slate-500">Page {page} sur {totalPages}</p><button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40">Suivant <ChevronRight size={15} /></button></div>;
}
