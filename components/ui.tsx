import Link from 'next/link';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';

export function AppButton({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const styles = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return <button {...props} className={`${styles} ${className}`}>{children}</button>;
}

export function AppLinkButton({ href, children, variant = 'primary', className = '' }: { href: string; children: ReactNode; variant?: ButtonVariant; className?: string }) {
  const styles = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return <Link href={href} className={`${styles} ${className}`}>{children}</Link>;
}

export function AppCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-slate-200 bg-white shadow-card ${className}`}>{children}</section>;
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="eyebrow text-brand-600">{eyebrow}</p>}<h1 className="mt-2 text-3xl font-black tracking-tight text-brand-900 sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">{description}</p>}</div>{children}</div>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center"><p className="text-sm font-bold text-slate-600">{title}</p>{description && <p className="mt-1 text-xs text-slate-400">{description}</p>}</div>;
}
