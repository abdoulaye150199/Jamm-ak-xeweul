'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Flag, Mail, Menu, Phone, X } from 'lucide-react';
import { navLinks } from '@/lib/data';

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return <header className="sticky top-0 z-40 border-b border-[#dfe3d8]/80 bg-[#f4f4f1]/85 backdrop-blur-xl"><div className="hidden"><div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 text-[11px] font-bold tracking-wide lg:px-8"><div className="flex items-center gap-6"><span className="flex items-center gap-2"><Phone size={13} className="text-brand-500" /> +221 77 123 45 67</span><span className="flex items-center gap-2"><Mail size={13} className="text-brand-500" /> contact@jammakxeewal.sn</span></div><span className="uppercase tracking-[.18em] text-white/40">Thiès-Nord · Construire ensemble</span></div></div><HeaderProgress /><div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-5 lg:h-[82px] lg:px-8"><HeaderLogo /><nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1.5 shadow-inner lg:flex">{navLinks.map(item => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${isActive(item.href) ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:bg-brand-50 hover:text-brand-900'}`}>{item.label}</Link>)}</nav><div className="hidden items-center gap-3 lg:flex"><Link href="/signaler" aria-current={isActive('/signaler') ? 'page' : undefined} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${isActive('/signaler') ? 'border-sun-500 bg-sun-50 text-brand-900' : 'border-slate-200 bg-white/60 text-slate-600 hover:border-sun-400 hover:text-brand-900'}`}><Flag size={15} className="text-sun-600" /> Signaler</Link><Link href="/inscription" className="btn-primary !bg-brand-600 !px-5 !py-2.5">Adhérer <ArrowUpRight size={15} /></Link></div><div className="flex items-center gap-2 lg:hidden"><Link href="/inscription" className="btn-primary shrink-0 !bg-brand-600 !px-3.5 !py-2.5 !text-xs sm:!px-4">Adhérer</Link><button onClick={() => setOpen(!open)} className="shrink-0 rounded-full border border-slate-200 p-2.5 text-brand-900" aria-expanded={open} aria-controls="mobile-navigation" aria-label="Menu">{open ? <X size={19} /> : <Menu size={19} />}</button></div></div>{open && <div id="mobile-navigation" className="border-t border-[#dfe3d8] bg-[#f4f4f1] px-4 pb-5 pt-3 sm:px-5 lg:hidden"><nav className="flex flex-col gap-1">{navLinks.map(item => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={`rounded-2xl px-4 py-3 font-bold transition ${isActive(item.href) ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-white hover:text-brand-900'}`}>{item.label}</Link>)}</nav><div className="mt-4 flex flex-col gap-2 border-t border-[#dfe3d8] pt-4"><Link href="/connexion" className="btn-secondary">Se connecter</Link><Link href="/signaler" className="btn-primary !bg-brand-900">Signaler un besoin <ArrowUpRight size={15} /></Link></div></div>}</header>;
}

function HeaderLogo() {
  return <Link href="/" aria-label="JÀMM AK XÉEWAL" className="group flex min-w-0 items-center gap-2 sm:gap-3"><span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-brand-900 text-white shadow-sm transition group-hover:rotate-3 sm:h-11 sm:w-11"><span className="text-sm font-black tracking-tighter">JA</span><span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-sun-500 ring-2 ring-white" /></span><span className="hidden min-w-0 truncate text-[15px] font-black tracking-[-.04em] text-brand-900 min-[380px]:inline-block sm:text-xl">JÀMM AK <span className="text-brand-600">XÉEWAL</span></span></Link>;
}

function HeaderProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => { const update = () => { const scrollable = document.documentElement.scrollHeight - window.innerHeight; setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0); }; update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  return <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-600 transition-transform duration-150" style={{ transform: `scaleX(${progress / 100})` }} />;
}
