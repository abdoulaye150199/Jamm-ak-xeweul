import Link from 'next/link';
import { ArrowDownRight, ArrowRight, CalendarDays, Check, ChevronRight, Clock3, HeartHandshake, Lightbulb, MapPin, Megaphone, MoveUpRight, QrCode, Quote, Sparkles, Users } from 'lucide-react';
import { ActivitySlider, ChatWidget, Footer, PublicHeader } from '@/components/site';
import { SplashScreen } from '@/components/splash-screen';
import { events } from '@/lib/data';

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f4f4f1]">
      <SplashScreen />
      <PublicHeader />
      <main>
        <HeroInspired />
        <PresidentMessage />
        <Manifesto />
        <Activities />
        <ActionSection />
        <Impact />
        <Agenda />
        <Closing />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

function Hero() {
  return <section className="hero-grid relative overflow-hidden text-white"><div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" /><div className="absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-sun-500/10 blur-3xl" /><div className="relative mx-auto max-w-7xl px-5 pb-5 pt-10 lg:px-8 lg:pt-16"><div className="grid min-h-[680px] items-center gap-12 lg:grid-cols-[.92fr_1.08fr]"><div className="reveal-up"><div className="mb-8 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[.24em] text-sun-400"><span className="h-px w-9 bg-sun-400" /> Thiès-Nord · 2026</div><h1 className="display-title max-w-2xl text-[4.25rem] font-extrabold leading-[.9] sm:text-7xl lg:text-[7.2rem]">La ville<br /><span className="text-sun-400">commence</span><br />par nous.</h1><p className="reveal-up reveal-up-delay-1 mt-8 max-w-lg text-lg leading-8 text-white/65">JÀMM AK XÉEWAL est le mouvement citoyen qui transforme les conversations de quartier en actions concrètes.</p><div className="reveal-up reveal-up-delay-2 mt-9 flex flex-wrap items-center gap-4"><Link href="/inscription" className="group inline-flex items-center gap-3 rounded-full bg-sun-500 px-6 py-4 text-sm font-extrabold text-brand-950 shadow-lg shadow-sun-500/20 transition hover:-translate-y-1 hover:bg-sun-400">Rejoindre le mouvement <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-950 text-sun-400 transition group-hover:translate-x-1"><ArrowRight size={13} /></span></Link><Link href="#manifeste" className="group inline-flex items-center gap-2 text-sm font-bold text-white/70 transition hover:text-white">Découvrir notre approche <ArrowDownRight size={17} className="transition group-hover:translate-x-1 group-hover:translate-y-1" /></Link></div></div><div className="relative mx-auto w-full max-w-[550px] reveal-up reveal-up-delay-1"><div className="absolute -inset-4 rounded-[3rem] border border-white/10" /><div className="absolute -right-4 -top-8 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-xl sm:-right-8"><span className="h-2 w-2 animate-pulse rounded-full bg-sun-400" /> En direct du terrain</div><div className="relative h-[500px] overflow-hidden rounded-[2.8rem] border border-white/10 bg-brand-900 shadow-2xl sm:h-[610px]"><img src="/hero-thies.svg" alt="Esplanade citoyenne de Thiès-Nord" className="h-full w-full object-cover opacity-90 transition duration-1000 hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/10 to-brand-950/10" /><div className="absolute left-6 top-6 flex h-16 w-16 items-center justify-center rounded-full bg-sun-500 text-brand-950 sm:left-8 sm:top-8"><MoveUpRight size={25} /></div><div className="absolute bottom-7 left-7 right-7 sm:bottom-9 sm:left-9 sm:right-9"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-sun-400">Notre énergie</p><p className="mt-2 max-w-xs text-3xl font-extrabold leading-tight tracking-tight">Une communauté qui se met en mouvement.</p></div></div><div className="float-slow absolute -bottom-6 -left-5 z-20 rounded-[1.5rem] bg-white p-4 text-brand-950 shadow-2xl sm:-left-10 sm:p-5"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><HeartHandshake size={21} /></span><div><p className="text-2xl font-extrabold leading-none">500+</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">citoyens actifs</p></div></div></div></div></div><div className="flex items-center justify-between border-t border-white/15 py-4 text-xs font-bold text-white/45"><span>Scroll pour découvrir</span><span className="flex items-center gap-2"><span className="h-px w-10 bg-white/25" /> 01 — 05</span></div></div></section>;
}

function HeroV2() {
  return <section className="relative min-h-[calc(100svh-76px)] overflow-hidden bg-brand-950 text-white"><img src="/hero-thies.png" alt="Esplanade citoyenne de Thiès-Nord" className="absolute inset-0 h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/80 to-brand-950/10" /><div className="absolute inset-0 bg-gradient-to-t from-brand-950/75 via-transparent to-brand-950/10" /><div className="relative mx-auto flex min-h-[calc(100svh-76px)] max-w-7xl items-end px-5 pb-12 pt-20 lg:px-8 lg:pb-20"><div className="max-w-2xl reveal-up"><div className="mb-7 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[.24em] text-sun-400"><span className="h-px w-9 bg-sun-400" /> Thiès-Nord · 2026</div><h1 className="display-title max-w-2xl text-6xl font-extrabold leading-[.88] sm:text-7xl lg:text-[6.8rem]">La ville<br /><span className="text-sun-400">commence</span><br />par nous.</h1><p className="reveal-up reveal-up-delay-1 mt-7 max-w-lg text-base leading-7 text-white/70 sm:text-lg">JÀMM AK XÉEWAL transforme les conversations de quartier en actions concrètes.</p><div className="reveal-up reveal-up-delay-2 mt-8 flex flex-wrap items-center gap-4"><Link href="/inscription" className="group inline-flex items-center gap-3 rounded-full bg-sun-500 px-6 py-4 text-sm font-extrabold text-brand-950 shadow-lg shadow-sun-500/25 transition hover:-translate-y-1 hover:bg-sun-400">Rejoindre le mouvement <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-950 text-sun-400 transition group-hover:translate-x-1"><ArrowRight size={13} /></span></Link><Link href="#manifeste" className="group inline-flex items-center gap-2 text-sm font-bold text-white/75 transition hover:text-white">Notre approche <ArrowDownRight size={17} className="transition group-hover:translate-x-1 group-hover:translate-y-1" /></Link></div></div><div className="absolute right-5 top-10 hidden flex-col items-end gap-2 text-right text-xs font-bold uppercase tracking-[.2em] text-white/55 lg:flex"><span className="text-sun-400">01</span><span className="h-16 w-px bg-white/30" /><span>05</span></div><div className="absolute bottom-8 right-5 hidden items-center gap-4 rounded-2xl border border-white/20 bg-brand-950/55 px-4 py-3 backdrop-blur-xl lg:flex"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-500 text-brand-950"><Users size={18} /></span><div><p className="text-xl font-extrabold leading-none">500+</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">citoyens actifs</p></div></div><div className="absolute bottom-8 left-5 flex items-center gap-3 text-xs font-bold text-white/55 lg:left-8"><span className="h-px w-9 bg-white/40" /> Scroll pour découvrir</div></div></section>;
}

function HeroV3() {
  return <section className="relative min-h-[calc(100svh-76px)] overflow-hidden bg-brand-950 text-white"><img src="/hero-thies.png" alt="Esplanade citoyenne de Thiès-Nord" className="absolute inset-0 h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/78 to-brand-950/10" /><div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-brand-950/10" /><div className="relative mx-auto flex min-h-[calc(100svh-76px)] max-w-7xl items-end px-5 pb-10 pt-12 lg:px-8 lg:pb-20"><div className="flex w-full flex-col gap-10 lg:flex-row lg:items-end lg:gap-12"><div className="order-2 lg:order-1 lg:mb-3"><QrCard /></div><div className="order-1 max-w-2xl reveal-up lg:order-2"><div className="mb-7 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[.24em] text-sun-400"><span className="h-px w-9 bg-sun-400" /> Thiès-Nord · 2026</div><h1 className="display-title max-w-2xl text-6xl font-extrabold leading-[.88] sm:text-7xl lg:text-[6.5rem]">La ville<br /><span className="text-sun-400">commence</span><br />par nous.</h1><p className="reveal-up reveal-up-delay-1 mt-7 max-w-lg text-base leading-7 text-white/70 sm:text-lg">JÀMM AK XÉEWAL transforme les conversations de quartier en actions concrètes.</p><div className="reveal-up reveal-up-delay-2 mt-8 flex flex-wrap items-center gap-4"><Link href="/inscription" className="group inline-flex items-center gap-3 rounded-full bg-sun-500 px-6 py-4 text-sm font-extrabold text-brand-950 shadow-lg shadow-sun-500/25 transition hover:-translate-y-1 hover:bg-sun-400">Rejoindre le mouvement <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-950 text-sun-400 transition group-hover:translate-x-1"><ArrowRight size={13} /></span></Link><Link href="#manifeste" className="group inline-flex items-center gap-2 text-sm font-bold text-white/75 transition hover:text-white">Notre approche <ArrowDownRight size={17} className="transition group-hover:translate-x-1 group-hover:translate-y-1" /></Link></div></div></div><div className="absolute right-5 top-10 hidden flex-col items-end gap-2 text-right text-xs font-bold uppercase tracking-[.2em] text-white/55 lg:flex"><span className="text-sun-400">01</span><span className="h-16 w-px bg-white/30" /><span>05</span></div><div className="absolute bottom-8 right-5 hidden items-center gap-4 rounded-2xl border border-white/20 bg-brand-950/55 px-4 py-3 backdrop-blur-xl lg:flex"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-500 text-brand-950"><Users size={18} /></span><div><p className="text-xl font-extrabold leading-none">500+</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">citoyens actifs</p></div></div><div className="absolute bottom-8 left-5 flex items-center gap-3 text-xs font-bold text-white/55 lg:left-8"><span className="h-px w-9 bg-white/40" /> Scroll pour découvrir</div></div></section>;
}

function QrCard() {
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=00351f&bgcolor=ffffff&data=https%3A%2F%2Fjammakxeewal.sn%2Finscription';
  return <div className="group relative w-full max-w-[260px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#f5f7f3] p-5 text-center text-brand-950 shadow-2xl transition duration-500 hover:-translate-y-2 lg:w-[260px]"><div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sun-500 via-sun-400 to-brand-600" /><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-200 bg-brand-100 text-brand-600"><QrCode size={24} /></div><h2 className="mt-4 text-2xl font-extrabold tracking-tight">Rejoignez-nous</h2><p className="mt-2 text-xs leading-5 text-slate-500">Scannez ce code avec votre téléphone pour adhérer au mouvement en <strong className="text-brand-600">1 minute</strong>.</p><div className="relative mx-auto mt-5 w-fit rounded-3xl bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,.12)]"><span className="absolute left-2 top-2 h-4 w-4 rounded-tl-md border-l-4 border-t-4 border-sun-500" /><span className="absolute right-2 top-2 h-4 w-4 rounded-tr-md border-r-4 border-t-4 border-sun-500" /><span className="absolute bottom-2 left-2 h-4 w-4 rounded-bl-md border-b-4 border-l-4 border-sun-500" /><span className="absolute bottom-2 right-2 h-4 w-4 rounded-br-md border-b-4 border-r-4 border-sun-500" /><img src={qrUrl} alt="QR code pour rejoindre le mouvement" className="h-36 w-36 rounded-xl object-contain" /></div><Link href="/inscription" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand-950 px-4 py-3 text-sm font-extrabold text-sun-400 transition hover:bg-brand-600">Ou cliquez ici <ArrowRight size={15} /></Link></div>;
}

function HeroInspired() {
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=00351f&bgcolor=ffffff&data=https%3A%2F%2Fjammakxeewal.sn%2Finscription';

  return <section className="hero-inspiration relative min-h-[calc(100svh-76px)] overflow-hidden text-brand-950">
    <img src="/hero-thies.png" alt="Esplanade citoyenne de Thiès-Nord" className="absolute inset-0 h-full w-full object-cover object-center opacity-80" />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f4f4f1]/95 via-[#f4f4f1]/48 to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14261d]/20 via-transparent to-white/10" />
    <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-sun-400/25 blur-3xl" />
    <div className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />

    <div className="relative mx-auto flex min-h-[calc(100svh-76px)] max-w-[1500px] items-center px-5 pb-20 pt-16 sm:px-8 lg:px-14">
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="hero-tile absolute left-[3%] top-[14%] w-52 -rotate-6 overflow-hidden rounded-2xl border-4 border-brand-950/10 bg-brand-950">
          <img src="/image%20hero/image%20copy%202.png" alt="Une rue de Thiès-Nord" className="h-44 w-full object-cover" />
          <p className="bg-brand-950 px-3 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white">Thiès-Nord · terrain</p>
        </div>
        <div className="hero-tile absolute left-[11%] bottom-[22%] w-28 rotate-6 overflow-hidden rounded-xl border-4 border-white/80">
          <img src="/image%20hero/image%20copy%206.png" alt="Action citoyenne de JÀMM AK XÉEWAL" className="h-32 w-full object-cover" />
        </div>
        <div className="hero-tile absolute left-[42%] top-[4%] w-32 -rotate-3 overflow-hidden rounded-xl border-4 border-white/80">
          <img src="/image%20hero/image.png" alt="Monument Lat Dior à Thiès" className="h-20 w-full object-cover" />
        </div>
        <div className="hero-tile absolute right-[9%] top-[13%] w-24 rotate-6 overflow-hidden rounded-xl border-4 border-white/80">
          <img src="/image%20hero/image%20copy%204.png" alt="École supérieure polytechnique de Thiès" className="h-24 w-full object-cover" />
        </div>
        <div className="hero-tile absolute right-[3%] top-[37%] w-44 -rotate-3 overflow-hidden rounded-xl border-4 border-brand-950/10">
          <img src="/image%20hero/image%20copy%205.png" alt="Stade Lat Dior de Thiès" className="h-32 w-full object-cover" />
        </div>
        <div className="hero-tile absolute right-[14%] bottom-[15%] w-36 rotate-3 overflow-hidden rounded-xl border-4 border-white/80">
          <img src="/image%20hero/image%20copy%203.png" alt="Gare historique de Thiès" className="h-32 w-full object-cover" />
        </div>
        <div className="hero-tile absolute left-[42%] bottom-[7%] w-40 -rotate-6 overflow-hidden rounded-xl border-4 border-white/80">
          <img src="/image%20hero/image%20copy.png" alt="Place publique de Thiès-Nord" className="h-24 w-full object-cover" />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <h1 className="display-title reveal-up reveal-up-delay-1 mt-7 text-[3rem] font-black leading-[.86] tracking-[-.09em] sm:text-6xl lg:text-[6.4rem]">
          Écouter les<br />
          <span className="text-brand-950">besoins du quartier</span><br />
          <span className="text-brand-950">Construire ensemble</span>
        </h1>
        <div className="reveal-up reveal-up-delay-3 mx-auto mt-8 flex w-full max-w-3xl flex-col gap-3 bg-brand-950 p-3 text-left text-white shadow-2xl shadow-brand-950/20 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/inscription" className="group inline-flex items-center gap-2 rounded-full bg-sun-500 px-4 py-3 text-xs font-extrabold text-brand-950 transition hover:-translate-y-0.5 hover:bg-sun-400 sm:px-5">
              Rejoindre le mouvement <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-950 text-sun-400 transition group-hover:translate-x-1"><ArrowRight size={12} /></span>
            </Link>
            <Link href="#manifeste" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-white/10 sm:px-5">
              Notre approche <ArrowDownRight size={14} />
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 border-t border-white/15 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <img src={qrUrl} alt="QR code pour rejoindre le mouvement" className="h-12 w-12 rounded-md bg-white p-1" />
            <div><p className="text-[10px] font-black uppercase tracking-[.14em] text-sun-400">Rejoignez-nous</p><p className="mt-1 text-[10px] text-white/60">Scannez · 1 minute</p></div>
          </div>
        </div>
      </div>
    </div>

    <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t-4 border-brand-950 bg-white py-3 text-brand-950">
      <div className="marquee-track flex w-max items-center gap-7 whitespace-nowrap text-2xl font-black uppercase tracking-[-.04em] sm:text-4xl">
        <span>Écouter</span><span className="text-sun-500">✦</span><span>Relier</span><span className="text-sun-500">✦</span><span>Agir</span><span className="text-sun-500">✦</span><span>Thiès-Nord</span><span className="text-sun-500">✦</span><span>Construire ensemble</span><span className="text-sun-500">✦</span>
        <span>Écouter</span><span className="text-sun-500">✦</span><span>Relier</span><span className="text-sun-500">✦</span><span>Agir</span><span className="text-sun-500">✦</span><span>Thiès-Nord</span><span className="text-sun-500">✦</span><span>Construire ensemble</span><span className="text-sun-500">✦</span>
      </div>
    </div>
  </section>;
}

function PresidentMessage() {
  return <section id="mot-du-president" className="bg-[#edf6eb] px-5 py-16 sm:py-20 lg:px-8 lg:py-28">
    <div className="mx-auto grid max-w-7xl overflow-hidden bg-brand-950 shadow-[0_30px_80px_rgba(20,38,29,.18)] lg:grid-cols-2">
      <div className="relative min-h-[420px] overflow-hidden sm:min-h-[540px] lg:min-h-[680px]">
        <img src="/image%20hero/image%20copy%206.png" alt="Des citoyens engagés sur le terrain" className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 rounded-full border border-white/30 bg-brand-950/55 px-4 py-2 text-[10px] font-black uppercase tracking-[.2em] text-white backdrop-blur-md sm:bottom-8 sm:left-8">JÀMM AK XÉEWAL · Sur le terrain</div>
      </div>
      <div className="relative flex flex-col justify-center p-8 text-white sm:p-12 lg:p-16">
        <span className="pointer-events-none absolute right-8 top-3 text-[9rem] font-black leading-none text-brand-600/20">“</span>
        <div className="relative">
          <p className="eyebrow flex items-center gap-3 text-sun-400"><span className="h-px w-12 bg-sun-400" /> Le mot du mouvement</p>
          <h2 className="display-title mt-7 max-w-xl text-4xl font-black leading-[.98] sm:text-5xl lg:text-[4.2rem]">Ensemble, bâtissons<br /><span className="text-brand-500">le Thiès-Nord de demain</span></h2>
          <div className="mt-9 max-w-xl space-y-5 text-base leading-7 text-white/65 sm:text-lg">
            <p>« Chères citoyennes, chers citoyens de Thiès-Nord,</p>
            <p>Notre localité regorge de talents, de ressources et d’une jeunesse dynamique. Le mouvement JÀMM AK XÉEWAL est votre outil. Il n’est pas conçu pour faire des promesses, mais pour bâtir avec vous.</p>
            <p>Chaque idée que vous proposez, chaque problème que vous signalez, constitue la brique de notre futur programme.</p>
            <p className="font-bold text-white">Agissons ensemble, dans la paix et pour la prospérité de tous. »</p>
          </div>
          <div className="mt-10 flex items-center gap-4 border-t border-white/15 pt-7">
            <span className="flex h-16 w-16 items-center justify-center bg-sun-500 text-3xl font-black italic text-brand-950">Jà</span>
            <div><p className="text-xl font-extrabold">Le mouvement</p><p className="mt-1 text-xs font-black uppercase tracking-[.16em] text-sun-400">JÀMM AK XÉEWAL</p></div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

function Manifesto() {
  return <section id="manifeste" className="soft-grid bg-[#f4f4f1] px-5 py-24 lg:px-8 lg:py-36"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.65fr_1.35fr]"><div><p className="text-8xl font-black leading-none tracking-[-.1em] text-brand-100">01</p><p className="eyebrow mt-5 text-brand-600">Le manifeste</p><p className="mt-2 text-sm font-bold text-slate-400">Une autre façon de faire société.</p></div><div><h2 className="display-title max-w-4xl text-4xl font-extrabold leading-[1.02] text-brand-900 sm:text-6xl">Les meilleures idées<br /><span className="text-brand-600">naissent au coin de la rue.</span></h2><p className="mt-8 max-w-2xl text-lg leading-8 text-slate-500">Nous croyons à une politique de proximité, faite de conversations simples, de besoins réels et d’actions visibles. Votre quotidien n’est pas une statistique : c’est le point de départ.</p><div className="mt-12 grid gap-8 border-t border-slate-200 pt-8 sm:grid-cols-3"><Principle number="01" title="Écouter" text="Les voix de chaque quartier, sans filtre." /><Principle number="02" title="Relier" text="Les personnes, les talents et les solutions." /><Principle number="03" title="Agir" text="Avec des résultats que l’on peut voir." /></div></div></div></section>;
}

function Activities() {
  return <section className="bg-white px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="eyebrow text-brand-600">Sur le terrain</p><h2 className="display-title mt-4 text-5xl font-extrabold text-brand-900 sm:text-6xl">Ce qui bouge<br /><span className="text-brand-500">près de chez vous.</span></h2></div><Link href="/activites" className="group inline-flex items-center gap-2 text-sm font-extrabold text-brand-900">Explorer les actions <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white"><ArrowRight size={14} /></span></Link></div><ActivitySlider /></div></section>;
}

function ActionSection() {
  return <section className="bg-[#f4f4f1] px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><div className="mb-12 flex items-end justify-between gap-6"><div><p className="text-8xl font-black leading-none tracking-[-.1em] text-brand-100">02</p><p className="eyebrow mt-5 text-brand-600">Passer à l’action</p><h2 className="display-title mt-4 text-4xl font-extrabold text-brand-900 sm:text-5xl">Votre rôle peut<br /><span className="text-brand-600">commencer aujourd’hui.</span></h2></div><Sparkles className="hidden text-sun-500 sm:block" size={36} /></div><div className="grid gap-4 md:grid-cols-3"><ActionCard number="01" icon={<Megaphone />} title="Signaler un besoin" text="Un problème de rue, d’éclairage ou d’assainissement ? Faites-le remonter." href="/signaler" tone="light" /><ActionCard number="02" icon={<Lightbulb />} title="Proposer une idée" text="Un projet pour l’emploi, la jeunesse ou votre quartier ? Partagez-le." href="/idee" tone="dark" /><ActionCard number="03" icon={<Users />} title="Rejoindre une équipe" text="Mettez votre temps, votre talent et votre énergie au service du collectif." href="/inscription" tone="accent" /></div></div></section>;
}

function Impact() {
  return <section className="bg-brand-950 px-5 py-24 text-white lg:px-8 lg:py-32"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr]"><div className="relative h-[390px] overflow-hidden rounded-[2rem] sm:h-[500px]"><img src="https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?auto=format&fit=crop&w=1200&q=90" alt="Une équipe de citoyens" className="h-full w-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent" /><div className="absolute bottom-7 left-7"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-sun-400">La force du collectif</p><p className="mt-2 text-2xl font-extrabold">Un quartier. Des milliers d’histoires.</p></div></div><div><Quote className="text-sun-400" size={38} /><blockquote className="display-title mt-7 text-4xl font-extrabold leading-tight sm:text-5xl">« On ne fait pas pour les habitants. On fait avec eux. »</blockquote><p className="mt-7 max-w-md text-lg leading-8 text-white/55">Chaque contribution devient une brique de notre futur programme. Chaque action crée un peu plus de confiance.</p><div className="mt-10 grid max-w-md grid-cols-2 gap-5 border-t border-white/15 pt-6"><ImpactStat value="15" label="quartiers mobilisés" /><ImpactStat value="32" label="actions réalisées" /></div></div></div></section>;
}

function Agenda() {
  return <section className="bg-white px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-[2rem] border border-slate-200 bg-[#f4f4f1] p-7 sm:p-10"><div className="flex items-start justify-between"><div><p className="eyebrow text-brand-600">Agenda citoyen</p><h2 className="mt-3 text-4xl font-extrabold tracking-tight text-brand-900">Les prochains rendez-vous.</h2></div><CalendarDays className="text-brand-500" /></div><div className="mt-9 space-y-3">{events.map(event => <div key={event.title} className={`group flex items-center gap-4 rounded-2xl p-4 transition ${event.featured ? 'bg-brand-900 text-white' : 'bg-white hover:-translate-y-0.5 hover:shadow-card'}`}><div className={`min-w-14 rounded-xl p-2 text-center ${event.featured ? 'bg-sun-500 text-brand-950' : 'bg-brand-100 text-brand-900'}`}><p className="text-[10px] font-extrabold uppercase">{event.weekday}</p><p className="text-2xl font-extrabold">{event.day}</p></div><div className="min-w-0 flex-1"><p className={`font-extrabold ${event.featured ? 'text-white' : 'text-brand-900'}`}>{event.title}</p><p className={`mt-1 flex flex-wrap gap-3 text-xs ${event.featured ? 'text-white/50' : 'text-slate-400'}`}><span className="flex items-center gap-1"><Clock3 size={12} /> {event.time}</span><span className="flex items-center gap-1"><MapPin size={12} /> {event.place}</span></p></div><ChevronRight size={17} className={event.featured ? 'text-sun-400' : 'text-slate-300'} /></div>)}</div></div><div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-sun-500 p-8 text-brand-950 sm:p-10"><div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full border-[38px] border-brand-950/10" /><div className="relative"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-950 text-sun-400"><Check size={22} strokeWidth={3} /></div><p className="eyebrow mt-8 text-brand-950/55">Votre espace citoyen</p><h2 className="mt-3 max-w-sm text-4xl font-extrabold leading-tight tracking-tight">Suivez l’impact de votre voix.</h2><p className="mt-5 max-w-sm leading-7 text-brand-950/65">Retrouvez vos signalements, vos idées et les actions auxquelles vous participez.</p></div><Link href="/connexion" className="relative mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-brand-950 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-700">Ouvrir mon espace <ArrowRight size={16} /></Link></div></div></section>;
}

function Closing() {
  return <section className="bg-[#f4f4f1] px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl rounded-[2.5rem] bg-brand-900 px-7 py-14 text-center text-white sm:px-12 lg:py-20"><p className="eyebrow text-sun-400">La suite s’écrit avec vous</p><h2 className="display-title mx-auto mt-5 max-w-3xl text-5xl font-extrabold leading-[.95] sm:text-7xl">Et vous, qu’est-ce que vous voulez changer ?</h2><p className="mx-auto mt-6 max-w-lg leading-7 text-white/55">Une idée, un besoin ou simplement l’envie d’aider : il y a une première action pour chacun.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/inscription" className="inline-flex items-center gap-2 rounded-full bg-sun-500 px-6 py-4 text-sm font-extrabold text-brand-950 transition hover:-translate-y-1 hover:bg-sun-400">Je rejoins le mouvement <ArrowRight size={16} /></Link><Link href="/mouvement" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10">En savoir plus <ArrowDownRight size={16} /></Link></div></div></section>;
}

function Principle({ number, title, text }: { number: string; title: string; text: string }) { return <div><p className="text-xs font-extrabold text-brand-500">{number}</p><h3 className="mt-3 font-extrabold text-brand-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>; }
function ImpactStat({ value, label }: { value: string; label: string }) { return <div><p className="text-3xl font-extrabold text-sun-400">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/40">{label}</p></div>; }
function ActionCard({ number, icon, title, text, href, tone }: { number: string; icon: React.ReactNode; title: string; text: string; href: string; tone: 'light' | 'dark' | 'accent' }) { const classes = tone === 'dark' ? 'bg-brand-900 text-white' : tone === 'accent' ? 'bg-sun-500 text-brand-950' : 'bg-white text-brand-900 border border-slate-200'; return <Link href={href} className={`group relative flex min-h-[320px] flex-col overflow-hidden rounded-[2rem] p-7 transition duration-500 hover:-translate-y-2 hover:shadow-soft sm:p-8 ${classes}`}><span className={`text-xs font-extrabold ${tone === 'dark' ? 'text-sun-400' : tone === 'accent' ? 'text-brand-950/45' : 'text-brand-500'}`}>{number}</span><div className={`mt-10 flex h-12 w-12 items-center justify-center rounded-2xl ${tone === 'dark' ? 'bg-white/10 text-sun-400' : tone === 'accent' ? 'bg-brand-950 text-sun-400' : 'bg-brand-100 text-brand-600'}`}>{icon}</div><h3 className="mt-7 text-2xl font-extrabold tracking-tight">{title}</h3><p className={`mt-3 max-w-xs text-sm leading-6 ${tone === 'dark' ? 'text-white/55' : tone === 'accent' ? 'text-brand-950/65' : 'text-slate-500'}`}>{text}</p><span className="absolute bottom-7 right-7 flex h-9 w-9 items-center justify-center rounded-full border border-current/20 transition group-hover:rotate-45"><ArrowRight size={15} /></span></Link>; }
