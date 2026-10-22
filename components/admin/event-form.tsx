'use client';

import { FormEvent, useState } from 'react';
import { Check, ChevronRight, LoaderCircle, Plus } from 'lucide-react';
import type { DashboardEvent } from '@/components/admin/types';

export function EventFormPage({ event: initialEvent, onClose, onSaved, backLabel = 'Retour au dashboard' }: { event?: DashboardEvent | null; onClose: () => void; onSaved: () => void | Promise<void>; backLabel?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const response = await fetch(initialEvent ? `/api/admin/events/${initialEvent.id}` : '/api/admin/events', {
        method: initialEvent ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.get('date'), title: formData.get('title'), time: formData.get('time'), place: formData.get('place'), featured: formData.get('featured') === 'on' }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? 'Impossible d’enregistrer cette activité.');
      await onSaved();
    } catch (reason) {
      setError(reason instanceof TypeError ? 'Erreur réseau. L’enregistrement n’a pas pu être confirmé. Vérifiez la liste avant de réessayer.' : reason instanceof Error ? reason.message : 'Impossible d’enregistrer cette activité. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="min-h-[calc(100vh-108px)] bg-[#f4f7f3] py-2 text-brand-900 sm:py-4"><div className="mx-auto max-w-3xl">
    <button type="button" onClick={onClose} disabled={busy} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-brand-700 disabled:opacity-50"><ChevronRight size={16} className="rotate-180" /> {backLabel}</button>
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-10">
      <div className="border-b border-slate-100 pb-6"><p className="eyebrow text-brand-600">Activités terrain</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{initialEvent ? 'Modifier l’activité' : 'Publier une nouvelle activité'}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{initialEvent ? 'Modifiez les informations ci-dessous. Les changements seront visibles dans les agendas public et membre.' : 'Complétez les informations ci-dessous. L’activité sera visible immédiatement dans les agendas public et membre.'}</p></div>
      <form onSubmit={submit} aria-busy={busy} className="mt-8">
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Titre *</span><input name="title" defaultValue={initialEvent?.title ?? ''} required maxLength={200} className="input-focus" placeholder="Causerie citoyenne" /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Date *</span><input name="date" defaultValue={initialEvent?.eventDate?.slice(0, 10) ?? ''} required type="date" className="input-focus" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Horaire *</span><input name="time" defaultValue={initialEvent?.time ?? ''} required maxLength={80} className="input-focus" placeholder="16h00 — 18h00" /></label>
          </div>
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Lieu *</span><input name="place" defaultValue={initialEvent?.place ?? ''} required maxLength={500} className="input-focus" placeholder="Quartier Nguinth" /></label>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-600"><input name="featured" defaultChecked={initialEvent?.featured ?? false} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Mettre cet événement en avant sur l’agenda</label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary disabled:opacity-50">Annuler</button>
            <button type="submit" className="btn-primary disabled:opacity-50">{busy ? <LoaderCircle size={16} className="animate-spin" /> : initialEvent ? <Check size={16} /> : <Plus size={16} />}{busy ? 'Enregistrement…' : initialEvent ? 'Enregistrer les modifications' : 'Publier l’activité'}</button>
          </div>
        </fieldset>
      </form>
    </div>
  </div></div>;
}
