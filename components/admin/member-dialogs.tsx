'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { AdminDialog } from '@/components/admin/dialog';
import { Status } from '@/components/admin-dashboard';
import type { DashboardMember, DashboardMemberDetails } from '@/components/admin/types';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date indisponible' : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Africa/Dakar' }).format(date);
}

export function MemberDetailsDialog({ member, onClose, onDelete }: { member: DashboardMember; onClose: () => void; onDelete: (member: DashboardMember) => void }) {
  const [details, setDetails] = useState<DashboardMemberDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        const response = await fetch(`/api/admin/members/${member.id}`, { cache: 'no-store', signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.member || !Array.isArray(data.contributions)) throw new Error(data?.error ?? 'Impossible de charger ce membre.');
        if (!controller.signal.aborted) setDetails(data);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof TypeError ? 'Erreur réseau. Réessayez de charger ce membre.' : reason instanceof Error ? reason.message : 'Impossible de charger ce membre.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [member.id, reload]);

  return <AdminDialog title="Détails du membre" onClose={onClose}>
    <div className="p-5 sm:p-6">
      {loading ? <p role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" /> Chargement du membre…</p> : error ? <div><p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p><button type="button" onClick={() => setReload(value => value + 1)} className="btn-secondary mt-4">Réessayer</button></div> : details && <>
        <p className="break-words text-2xl font-extrabold">{details.member.firstName} {details.member.lastName}</p>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <MemberField label="Adresse e-mail"><a className="break-all text-brand-600 underline" href={`mailto:${details.member.email}`}>{details.member.email}</a></MemberField>
          <MemberField label="Téléphone"><a className="text-brand-600 underline" href={`tel:${details.member.phone.replace(/[^\d+]/g, '')}`}>{details.member.phone}</a></MemberField>
          <MemberField label="Quartier">{details.member.neighborhood}</MemberField>
          <MemberField label="Date d’inscription">{formatDate(details.member.createdAt)}</MemberField>
        </dl>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <MemberCount label="Contributions" value={details.contributionCount} />
          <MemberCount label="Idées" value={details.ideaCount} />
          <MemberCount label="Besoins" value={details.contributionCount - details.ideaCount} />
        </div>
        <section className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="font-extrabold">Contributions récentes</h3>
          <p className="mt-1 text-xs text-slate-400">Les 10 dernières contributions de ce membre.</p>
          {details.contributions.length ? <div className="mt-3 divide-y divide-slate-100">{details.contributions.map(contribution => <article key={contribution.id} className="py-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><p className="min-w-0 break-words text-sm font-bold">{contribution.title}</p><Status status={contribution.status} /></div>
            <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6 text-slate-500">{contribution.description}</p>
            <p className="mt-2 text-xs text-slate-400">{contribution.type} · {formatDate(contribution.createdAt)}</p>
          </article>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Ce membre n’a pas encore envoyé de contribution.</p>}
        </section>
      </>}
    </div>
    <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 p-5 sm:p-6">
      <button type="button" onClick={onClose} className="btn-secondary">Fermer les détails</button>
      {details && !loading && !error && <button type="button" onClick={() => onDelete(details.member)} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-100"><Trash2 size={16} /> Supprimer ce membre</button>}
    </div>
  </AdminDialog>;
}

function MemberField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><dt className="text-xs font-bold text-slate-400">{label}</dt><dd className="mt-1 break-words font-medium">{children}</dd></div>;
}

function MemberCount({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-brand-50 p-3"><p className="text-xl font-extrabold">{value}</p><p className="mt-1 text-[10px] font-bold text-brand-600 sm:text-xs">{label}</p></div>;
}

export function DeleteMemberDialog({ member, busy, error, onClose, onConfirm }: { member: DashboardMember; busy: boolean; error: string; onClose: () => void; onConfirm: () => void }) {
  return <AdminDialog title="Supprimer ce membre ?" onClose={onClose} busy={busy} destructive>
    <div className="p-5 sm:p-6">
      <p className="break-words text-sm leading-6 text-slate-600">Le compte de <strong className="text-brand-900">{member.firstName} {member.lastName}</strong> et ses notifications personnelles seront supprimés. Ce membre ne pourra plus se connecter.</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">Ses contributions seront conservées dans l’administration pour assurer leur suivi. La suppression du compte est définitive.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
    </div>
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end sm:p-6">
      <button type="button" data-initial-focus onClick={onClose} disabled={busy} className="btn-secondary disabled:opacity-50">Annuler</button>
      <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">{busy ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}{busy ? 'Suppression…' : 'Supprimer définitivement'}</button>
    </div>
  </AdminDialog>;
}
