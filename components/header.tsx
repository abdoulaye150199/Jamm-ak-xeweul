'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Flag, Menu, X } from 'lucide-react';
import { navLinks } from '@/lib/data';

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return <header className="sticky top-0 z-40 border-b border-[#dfe3d8]/80 bg-[#f4f4f1]/85 backdrop-blur-xl"><HeaderProgress /><div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8"><HeaderLogo /><nav className="hidden items-center gap-1 lg:flex">{navLinks.map(item => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${isActive(item.href) ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-brand-900'}`}>{item.label}</Link>)}</nav><div className="hidden items-center gap-3 lg:flex"><Link href="/signaler" aria-current={isActive('/signaler') ? 'page' : undefined} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${isActive('/signaler') ? 'border-sun-500 bg-sun-50 text-brand-900' : 'border-slate-200 bg-white/60 text-slate-600 hover:border-sun-400 hover:text-brand-900'}`}><Flag size={15} className="text-sun-600" /> Signaler</Link><Link href="/connexion" className="text-sm font-bold text-brand-900 transition hover:text-brand-600">Se connecter</Link><Link href="/inscription" className="btn-primary !bg-brand-900 !px-5 !py-2.5">Rejoindre <ArrowUpRight size={15} /></Link></div><div className="flex items-center gap-2 lg:hidden"><Link href="/signaler" className="inline-flex items-center gap-1.5 rounded-full border border-sun-400 bg-sun-50 px-3 py-2 text-xs font-extrabold text-brand-900"><Flag size={14} className="text-sun-600" /> Signaler</Link><Link href="/inscription" className="btn-primary !bg-brand-900 !px-4 !py-2.5 !text-xs">Adhérer</Link><button onClick={() => setOpen(!open)} className="rounded-full border border-slate-200 p-2.5 text-brand-900" aria-label="Menu">{open ? <X size={19} /> : <Menu size={19} />}</button></div></div>{open && <div className="border-t border-[#dfe3d8] bg-[#f4f4f1] px-5 pb-6 pt-3 lg:hidden"><nav className="flex flex-col gap-1">{navLinks.map(item => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={`rounded-2xl px-4 py-3 font-bold transition ${isActive(item.href) ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-white hover:text-brand-900'}`}>{item.label}</Link>)}</nav><div className="mt-4 flex flex-col gap-2 border-t border-[#dfe3d8] pt-4"><Link href="/connexion" className="btn-secondary">Se connecter</Link><Link href="/signaler" className="btn-primary !bg-brand-900">Signaler un besoin <ArrowUpRight size={15} /></Link></div></div>}</header>;
}

function HeaderLogo() {
  return <Link href="/" className="group flex items-center gap-3"><span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-brand-900 text-white transition group-hover:rotate-3"><span className="text-sm font-black tracking-tighter">JA</span><span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-sun-500 ring-2 ring-white" /></span><span className="font-extrabold leading-[.9] tracking-[-.04em] text-brand-900">JÀMM AK<br /><span className="text-brand-600">XÉEWAL</span></span></Link>;
}

function HeaderProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => { const update = () => { const scrollable = document.documentElement.scrollHeight - window.innerHeight; setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0); }; update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  return <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-600 transition-transform duration-150" style={{ transform: `scaleX(${progress / 100})` }} />;
}
