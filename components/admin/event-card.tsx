'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { DashboardEvent } from '@/components/admin/types';

export function EventCard({ event, onEdit, onDelete }: { event: DashboardEvent; onEdit: (event: DashboardEvent) => void; onDelete: (event: DashboardEvent) => void }) {
  const date = event.eventDate ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Africa/Dakar' }).format(new Date(event.eventDate)) : `${event.weekday} ${event.day}`;
  return <article className="flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-brand-600"><span className="rounded-lg bg-sun-100 px-2 py-1 text-sun-700">{date}</span><span className="break-words">{event.time}</span></div>
    <h2 className="mt-3 break-words font-extrabold">{event.title}</h2>
    <p className="mt-1 break-words text-sm text-slate-500">{event.place}</p>
    {event.featured && <span className="mt-3 self-start rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-brand-600">En avant</span>}
    <div className="mt-auto flex flex-wrap gap-2 pt-4">
      <button type="button" onClick={() => onEdit(event)} aria-label={`Modifier ${event.title}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50"><Pencil size={15} /> Modifier</button>
      <button type="button" onClick={() => onDelete(event)} aria-label={`Supprimer ${event.title}`} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"><Trash2 size={15} /> Supprimer</button>
    </div>
  </article>;
}
