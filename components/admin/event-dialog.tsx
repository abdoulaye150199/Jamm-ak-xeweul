'use client';

import { useState } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { AdminDialog } from '@/components/admin/dialog';
import type { DashboardEvent } from '@/components/admin/types';

export function DeleteEventDialog({ event, onClose, onDeleted }: { event: DashboardEvent; onClose: () => void; onDeleted: () => void | Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => null);
      if (!response.ok && response.status !== 404) throw new Error(data?.error ?? 'Impossible de supprimer cette activité.');
      await onDeleted();
    } catch (reason) {
      setError(reason instanceof TypeError ? 'Erreur réseau. Le résultat de la suppression n’a pas pu être confirmé. Réessayez.' : reason instanceof Error ? reason.message : 'Impossible de supprimer cette activité. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  return <AdminDialog title="Supprimer cette activité ?" onClose={onClose} busy={busy} destructive>
    <div className="p-5 sm:p-6">
      <p className="break-words text-sm leading-6 text-slate-600">L’activité <strong className="text-brand-900">{event.title}</strong> sera retirée des agendas public et membre.</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">Cette suppression est définitive.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
    </div>
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end sm:p-6">
      <button type="button" data-initial-focus onClick={onClose} disabled={busy} className="btn-secondary disabled:opacity-50">Annuler</button>
      <button type="button" onClick={confirm} disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">{busy ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}{busy ? 'Suppression…' : 'Supprimer définitivement'}</button>
    </div>
  </AdminDialog>;
}
