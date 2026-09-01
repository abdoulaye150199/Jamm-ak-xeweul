'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, ArrowUpRight, Bell, CheckCircle2, ChevronRight, FileText,
  LayoutDashboard, Lightbulb, LogOut, Menu, MoreHorizontal, Plus,
  Search, Settings, Users, X,
} from 'lucide-react';

type ContributionStatus = 'Nouveau' | 'En étude' | 'En cours' | 'Résolu';
type ContributionType = 'Besoin' | 'Idée';
type Contribution = { title: string; author: string; neighborhood: string; type: ContributionType; status: ContributionStatus; date: string };

const contributions: Contribution[] = [
  { title: 'Éclairage public rue 14', author: 'Awa Diop', neighborhood: 'Nguinth', type: 'Besoin', status: 'Nouveau', date: 'Il y a 12 min' },
  { title: 'Atelier de formation numérique', author: 'Moussa Fall', neighborhood: 'Diakhao', type: 'Idée', status: 'En étude', date: 'Il y a 45 min' },
  { title: 'Point de collecte de proximité', author: 'Fatou Seck', neighborhood: 'Keur Mame El Hadj', type: 'Besoin', status: 'En cours', date: 'Il y a 2 h' },
  { title: 'Terrain de proximité pour les jeunes', author: 'Ibrahima Sy', neighborhood: 'Nguinth', type: 'Idée', status: 'Résolu', date: 'Hier' },
];

const sideLinks = [
  { label: "Vue d'ensemble", icon: LayoutDashboard },
  { label: 'Contributions', icon: FileText, count: '28' },
  { label: 'Membres', icon: Users },
  { label: 'Activités terrain', icon: Activity },
];

export function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<'Toutes' | ContributionType>('Toutes');
  const [query, setQuery] = useState('');
  const router = useRouter();
  const filteredContributions = contributions.filter(contribution => {
    const search = `${contribution.title} ${contribution.author} ${contribution.neighborhood}`.toLowerCase();
    return (filter === 'Toutes' || contribution.type === filter) && search.includes(query.toLowerCase());
  });

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/login/admin');
    router.refresh();
  }

  return <div className="min-h-screen bg-[#f4f7f3] pt-[68px] text-brand-900 sm:pt-[76px]">
    <AdminTopbar onMenu={() => setMenuOpen(true)} />
    <div className="mx-auto flex max-w-[1540px] gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} />
      <main className="min-w-0 flex-1 lg:ml-[264px]">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow text-brand-600">Vendredi 28 août 2026 · Thiès-Nord</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Bonjour Aminata.</h1><p className="mt-2 text-sm text-slate-500 sm:text-base">Voici ce qui mérite votre attention aujourd’hui.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row"><button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold shadow-sm transition hover:border-brand-300 hover:bg-brand-50"><ArrowUpRight size={16} /> Exporter le rapport</button><button className="btn-primary !rounded-xl !bg-brand-900"><Plus size={17} /> Nouvelle activité</button></div>
        </div>

        <AdminStats />

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.7fr)]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-100 p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-extrabold">Contributions récentes</h2><span className="rounded-full bg-sun-50 px-2.5 py-1 text-[11px] font-extrabold text-sun-700">28 à traiter</span></div><p className="mt-1 text-sm text-slate-500">Les dernières remontées des habitants.</p></div><Link href="#" className="inline-flex items-center gap-1 text-sm font-bold text-brand-600">Voir tout <ChevronRight size={15} /></Link></div><div className="mt-5 flex flex-col gap-3 md:flex-row"><label className="relative min-w-0 flex-1"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher une contribution" className="input-focus !min-h-11 !rounded-xl !py-2.5 !pl-10" /></label><div className="flex shrink-0 rounded-xl bg-slate-100 p-1">{(['Toutes', 'Besoin', 'Idée'] as const).map(item => <button key={item} onClick={() => setFilter(item)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-extrabold transition md:flex-none ${filter === item ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-brand-900'}`}>{item}</button>)}</div></div></div>
            <div className="divide-y divide-slate-100 md:hidden">{filteredContributions.map(contribution => <ContributionCard key={contribution.title} contribution={contribution} />)}{!filteredContributions.length && <EmptyState />}</div>
            <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[.16em] text-slate-400"><tr><th className="px-6 py-3 font-extrabold">Contribution</th><th className="px-4 py-3 font-extrabold">Type</th><th className="px-4 py-3 font-extrabold">Statut</th><th className="px-4 py-3 font-extrabold">Date</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{filteredContributions.map(contribution => <ContributionRow key={contribution.title} contribution={contribution} />)}</tbody></table>{!filteredContributions.length && <EmptyState />}</div>
          </section>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1"><section className="rounded-3xl bg-brand-900 p-5 text-white shadow-soft sm:p-6"><div className="flex items-start justify-between"><div><p className="eyebrow text-sun-400">File de traitement</p><p className="mt-3 text-4xl font-black">28</p><p className="mt-1 text-sm text-white/55">contributions en attente</p></div><span className="rounded-2xl bg-sun-500/15 p-3 text-sun-400"><Bell size={21} /></span></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[72%] rounded-full bg-sun-500" /></div><div className="mt-2 flex justify-between text-xs text-white/45"><span>Traitement du mois</span><span>72%</span></div><button className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold transition hover:bg-brand-500">Ouvrir la file <ArrowUpRight size={15} /></button></section><RecentActivity /></div>
        </div>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow text-brand-600">Pilotage mensuel</p><h2 className="mt-2 text-xl font-extrabold">Les priorités du mouvement</h2></div><button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Plus d'options"><MoreHorizontal size={19} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Priority icon={<Lightbulb />} title="Idées à qualifier" value="11" detail="3 nouvelles cette semaine" tone="yellow" /><Priority icon={<Users />} title="Nouveaux membres" value="42" detail="+12% par rapport au mois dernier" tone="green" /><Priority icon={<Activity />} title="Actions réalisées" value="08" detail="sur 10 actions planifiées" tone="blue" /></div></section>
      </main>
    </div>
  </div>;
}

function AdminTopbar({ onMenu }: { onMenu: () => void }) {
  return <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white"><div className="mx-auto flex h-[68px] max-w-[1540px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button onClick={onMenu} className="rounded-xl border border-slate-200 p-2.5 text-brand-900 lg:hidden" aria-label="Ouvrir le menu"><Menu size={19} /></button><Link href="/admin" className="flex shrink-0 items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-sm font-black text-white">JA</span><span className="hidden border-l border-slate-200 pl-3 text-sm font-extrabold sm:block">Administration</span></Link></div><div className="flex items-center gap-2 sm:gap-3"><div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 md:flex"><Search size={16} /><span>Rechercher</span><kbd className="rounded bg-white px-1.5 py-0.5 text-[10px]">⌘ K</kbd></div><button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500" aria-label="Notifications"><Bell size={18} /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-sun-500 ring-2 ring-white" /></button><div className="hidden items-center gap-3 border-l border-slate-200 pl-3 sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun-100 text-xs font-extrabold text-sun-700">AD</span><div><p className="text-xs font-bold">Aminata Diop</p><p className="text-[11px] text-slate-400">Administratrice</p></div></div></div></div></header>;
}

function AdminSidebar({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  return <>
    <div onClick={onClose} className={`fixed inset-0 z-40 bg-brand-950/40 transition lg:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`} />
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] transform flex-col overflow-hidden border-r border-slate-200 bg-white p-4 shadow-2xl transition-transform lg:inset-y-auto lg:left-[max(2rem,calc((100vw-1540px)/2+2rem))] lg:top-[92px] lg:h-[calc(100vh-108px)] lg:w-60 lg:rounded-3xl lg:border lg:p-3 lg:shadow-card ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="mb-5 flex items-center justify-between px-2 lg:hidden">
        <p className="font-extrabold">Menu admin</p>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-500" aria-label="Fermer le menu"><X size={19} /></button>
      </div>
      <div className="px-3 pb-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">Pilotage</div>
      <nav className="space-y-1">
        {sideLinks.map(({ label, icon: Icon, count }) => <Link key={label} href="#" onClick={onClose} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${label === "Vue d'ensemble" ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/15' : 'text-slate-500 hover:bg-brand-50 hover:text-brand-700'}`}><Icon size={17} /><span className="flex-1">{label}</span>{count && <span className="rounded-full bg-sun-100 px-2 py-0.5 text-[10px] text-sun-700">{count}</span>}</Link>)}
      </nav>
      <div className="mt-auto">
        <div className="my-5 h-px bg-slate-100" />
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">Compte</div>
        <Link href="#" className="mt-4 flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-500 hover:bg-slate-50"><Settings size={17} /> Paramètres</Link>
        <button onClick={onLogout} className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-red-500 hover:bg-red-50"><LogOut size={17} /> Se déconnecter</button>
      </div>
    </aside>
  </>;
}

function AdminStats() { return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={<Users />} label="Membres actifs" value="528" change="+12% ce mois" tone="green" /><Stat icon={<FileText />} label="Contributions" value="146" change="28 à traiter" tone="yellow" /><Stat icon={<Activity />} label="Actions terrain" value="32" change="4 ce mois" tone="blue" /><Stat icon={<CheckCircle2 />} label="Taux de réponse" value="91%" change="+6% ce mois" tone="green" /></div>; }
function Stat({ icon, label, value, change, tone }: { icon: React.ReactNode; label: string; value: string; change: string; tone: 'green' | 'yellow' | 'blue' }) { const colors = { green: 'bg-brand-50 text-brand-600', yellow: 'bg-sun-50 text-sun-600', blue: 'bg-blue-50 text-blue-600' }; return <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-card sm:p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold text-slate-500">{label}</p><span className={`rounded-xl p-2 ${colors[tone]}`}>{icon}</span></div><p className="mt-3 text-2xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs font-bold text-brand-500">{change}</p></div>; }
function ContributionCard({ contribution }: { contribution: Contribution }) { return <article className="p-4"><div className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sun-500" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="font-extrabold leading-5">{contribution.title}</p><Status status={contribution.status} /></div><p className="mt-1 text-xs text-slate-400">{contribution.author} · {contribution.neighborhood}</p><p className="mt-3 text-xs text-slate-400">{contribution.type} · {contribution.date}</p></div></div></article>; }
function ContributionRow({ contribution }: { contribution: Contribution }) { return <tr className="transition hover:bg-brand-50/40"><td className="px-6 py-4"><p className="font-bold">{contribution.title}</p><p className="mt-1 text-xs text-slate-400">{contribution.author} · {contribution.neighborhood}</p></td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{contribution.type}</span></td><td className="px-4 py-4"><Status status={contribution.status} /></td><td className="px-4 py-4 text-xs text-slate-500">{contribution.date}</td><td className="px-4 py-4 text-right"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-700" aria-label={`Options pour ${contribution.title}`}><MoreHorizontal size={17} /></button></td></tr>; }
function Status({ status }: { status: ContributionStatus }) { const style = status === 'Résolu' ? 'bg-brand-50 text-brand-600' : status === 'Nouveau' ? 'bg-sun-50 text-sun-700' : status === 'En cours' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'; return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold ${style}`}>{status}</span>; }
function EmptyState() { return <div className="p-8 text-center text-sm text-slate-500">Aucune contribution ne correspond à votre recherche.</div>; }
function RecentActivity() { return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"><div className="flex items-center justify-between"><div><p className="eyebrow text-brand-600">Journal</p><h2 className="mt-2 text-xl font-extrabold">Activité récente</h2></div><button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Plus d'options"><MoreHorizontal size={19} /></button></div><div className="mt-5 space-y-5"><Timeline color="green" title="Nouvelle adhésion" detail="Fatou Seck · il y a 12 min" /><Timeline color="yellow" title="Idée mise en étude" detail="Équipe programme · il y a 45 min" /><Timeline color="blue" title="Action publiée" detail="Communication · il y a 2 h" /></div></section>; }
function Timeline({ color, title, detail }: { color: 'green' | 'yellow' | 'blue'; title: string; detail: string }) { return <div className="flex gap-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color === 'green' ? 'bg-brand-500' : color === 'yellow' ? 'bg-sun-500' : 'bg-blue-500'}`} /><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div></div>; }
function Priority({ icon, title, value, detail, tone }: { icon: React.ReactNode; title: string; value: string; detail: string; tone: 'yellow' | 'green' | 'blue' }) { const colors = { yellow: 'bg-sun-50 text-sun-600', green: 'bg-brand-50 text-brand-600', blue: 'bg-blue-50 text-blue-600' }; return <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><span className={`rounded-xl p-2.5 ${colors[tone]}`}>{icon}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div><p className="text-2xl font-black">{value}</p></div>; }
