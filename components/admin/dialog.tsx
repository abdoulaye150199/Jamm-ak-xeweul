'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export function AdminDialog({ title, children, onClose, busy = false, destructive = false }: { title: string; children: React.ReactNode; onClose: () => void; busy?: boolean; destructive?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-initial-focus]')?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={ref} role={destructive ? 'alertdialog' : 'dialog'} aria-labelledby={titleId} aria-busy={busy} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }} className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 text-brand-900 shadow-2xl backdrop:bg-brand-950/50">
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
      <h2 id={titleId} className="text-xl font-extrabold">{title}</h2>
      <button type="button" onClick={onClose} disabled={busy} aria-label="Fermer la fenêtre" className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-40"><X size={20} /></button>
    </div>
    {children}
  </dialog>;
}
