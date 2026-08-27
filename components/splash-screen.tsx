'use client';

import { useEffect, useState } from 'react';

const splashImages = [
  { src: '/image%20hero/image%20copy%202.png', alt: 'Une rue de Thiès-Nord', className: 'splash-image-1' },
  { src: '/image%20hero/image%20copy%206.png', alt: 'Une action citoyenne', className: 'splash-image-2' },
  { src: '/image%20hero/image.png', alt: 'Le monument Lat Dior', className: 'splash-image-3' },
  { src: '/image%20hero/image%20copy%204.png', alt: 'L’École supérieure polytechnique de Thiès', className: 'splash-image-4' },
  { src: '/image%20hero/image%20copy%205.png', alt: 'Le stade Lat Dior', className: 'splash-image-5' },
  { src: '/image%20hero/image%20copy%203.png', alt: 'La gare historique de Thiès', className: 'splash-image-6' },
  { src: '/image%20hero/image%20copy.png', alt: 'Une place de Thiès-Nord', className: 'splash-image-7' },
];

export function SplashScreen() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const isReload = navigation?.type === 'reload';
    const storageKey = 'jamm-ak-xeewal-splash-seen';
    const hasSeenSplash = sessionStorage.getItem(storageKey) === 'true';

    if (hasSeenSplash && !isReload) {
      setVisible(false);
      return;
    }

    sessionStorage.setItem(storageKey, 'true');
    setVisible(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Start the handoff while the last images are still settling so the sequence never pauses.
    const leaveDelay = reducedMotion ? 250 : 1100;
    const hideDelay = reducedMotion ? 450 : 2350;
    const leaveTimer = window.setTimeout(() => setLeaving(true), leaveDelay);
    const hideTimer = window.setTimeout(() => setVisible(false), hideDelay);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (visible !== true) return null;

  return <div className={`splash-screen${leaving ? ' is-leaving' : ''}`} role="status" aria-label="Chargement de JÀMM AK XÉEWAL">
    <img className="splash-background" src="/hero-thies.png" alt="" aria-hidden="true" />
    <div className="splash-background-overlay" aria-hidden="true" />
    <div className="splash-grid" aria-hidden="true" />
    <div className="splash-images" aria-hidden="true">
      {splashImages.map(image => <div key={image.src} className={`splash-image ${image.className}`}><img src={image.src} alt="" /></div>)}
    </div>
  </div>;
}
