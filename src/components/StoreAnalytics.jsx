import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { analyticsChoice, setAnalyticsChoice, track, flushAnalytics } from '../lib/analytics';
import { publicPath } from '../../server/growth-model';
import { PRODUCTS } from '../data/products';

export default function StoreAnalytics() {
  const { pathname } = useLocation();
  const [choice, setChoice] = useState(analyticsChoice);
  const [preferences, setPreferences] = useState(false);
  useEffect(() => {
    const update = () => setChoice(analyticsChoice());
    const open = () => setPreferences(true);
    window.addEventListener('twenty3-analytics-choice', update);
    window.addEventListener('twenty3-analytics-preferences', open);
    return () => { window.removeEventListener('twenty3-analytics-choice', update); window.removeEventListener('twenty3-analytics-preferences', open); };
  }, []);
  useEffect(() => {
    if (choice !== 'accepted' || publicPath(pathname) === '/private') return;
    // Delay setup by one task so React StrictMode's probe does not double-count visits.
    let cleanup = () => {};
    const startTimer = setTimeout(() => {
      track('page_view', { path: pathname });
      const product = PRODUCTS.find(p => pathname === `/product/${p.id}`);
      if (product) track('product_view', { productId: product.id });
      const depths = new Set();
      let visibleStart = document.hidden ? null : Date.now();
      let seconds = 0;
      const engagement = () => {
        if (visibleStart !== null) seconds += (Date.now() - visibleStart) / 1000;
        visibleStart = document.hidden ? null : Date.now();
        if (seconds >= 1) { track('page_engagement', { path: pathname, seconds: Math.round(seconds) }); seconds = 0; }
      };
      const scroll = () => {
        const height = document.documentElement.scrollHeight;
        const progress = Math.min(100, Math.round(((window.scrollY + innerHeight) / height) * 100));
        for (const depth of [25, 50, 75, 100]) if (progress >= depth && !depths.has(depth)) { depths.add(depth); track('scroll_depth', { path: pathname, depth }); }
      };
      const click = event => {
        const link = event.target.closest?.('a[href]');
        if (!link) return;
        try {
          const url = new URL(link.href);
          if (url.hostname === 'wa.me') track('whatsapp_click', { path: pathname });
          else if (url.origin === location.origin && publicPath(url.pathname) !== '/private') track('navigation', { path: pathname, destination: publicPath(url.pathname) });
        } catch { /* Not a web link. */ }
      };
      const hide = () => { engagement(); if (document.hidden) flushAnalytics(); };
      const leave = () => { engagement(); flushAnalytics(); };
      document.addEventListener('click', click); window.addEventListener('scroll', scroll, { passive: true });
      document.addEventListener('visibilitychange', hide); window.addEventListener('pagehide', leave);
      cleanup = () => { engagement(); document.removeEventListener('click', click); window.removeEventListener('scroll', scroll); document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', leave); };
    }, 0);
    return () => { clearTimeout(startTimer); cleanup(); };
  }, [pathname, choice]);
  if (pathname.startsWith('/admin') || (choice && !preferences)) return null;
  const choose = value => { setAnalyticsChoice(value); setPreferences(false); };
  return <aside className="analytics-choice" aria-label="Analytics preferences"><div><strong>Help us improve Twenty3</strong><p>Allow optional analytics for page visits, clicks, and shopping activity. We do not record passwords, form text, or screen recordings. <Link to="/privacy">Privacy details</Link></p></div><div className="analytics-choice-actions"><button onClick={() => choose('declined')}>No thanks</button><button onClick={() => choose('accepted')} disabled={navigator.globalPrivacyControl === true}>Allow analytics</button></div></aside>;
}
