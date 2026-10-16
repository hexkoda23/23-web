import { auth } from './firebase';
import { publicPath } from '../../server/growth-model';

const CONSENT = 'twenty3-analytics-choice';
const SESSION = 'twenty3-analytics-session';
let queue = [];
let timer;
let busy = false;
let failures = 0;
export function analyticsChoice() {
  try { return navigator.globalPrivacyControl ? 'declined' : localStorage.getItem(CONSENT); } catch { return 'declined'; }
}
export function setAnalyticsChoice(choice) {
  try { localStorage.setItem(CONSENT, choice); if (choice !== 'accepted') sessionStorage.removeItem(SESSION); } catch { /* Storage may be disabled. */ }
  if (choice !== 'accepted') { queue = []; clearTimeout(timer); }
  window.dispatchEvent(new Event('twenty3-analytics-choice'));
}
function session() {
  const now = Date.now();
  let value;
  try { value = JSON.parse(sessionStorage.getItem(SESSION) || 'null'); } catch { /* Start a new session. */ }
  if (!value || now - value.last > 30 * 60 * 1000) {
    const params = new URLSearchParams(window.location.search);
    let referrer = '';
    try { referrer = new URL(document.referrer).hostname; } catch { /* Direct traffic. */ }
    value = { id: crypto.randomUUID(), source: params.get('utm_source') || (referrer && referrer !== location.hostname ? referrer : 'direct'), medium: params.get('utm_medium') || '', campaign: params.get('utm_campaign') || '' };
  }
  value.last = now;
  sessionStorage.setItem(SESSION, JSON.stringify(value));
  return value;
}
export function track(type, data = {}) {
  if (analyticsChoice() !== 'accepted' || publicPath(location.pathname) === '/private') return;
  try {
    const s = session();
    const cleanTag = value => String(value || '').replace(/[^a-zA-Z0-9 _./-]/g, '').slice(0, 80);
    queue.push({ sessionId: s.id, event: { id: crypto.randomUUID(), type, path: publicPath(location.pathname),
      source: cleanTag(s.source), medium: cleanTag(s.medium), campaign: cleanTag(s.campaign),
      device: innerWidth < 768 ? 'mobile' : innerWidth < 1024 ? 'tablet' : 'desktop', ...data } });
    queue = queue.slice(-60);
    if (!timer) timer = setTimeout(flushAnalytics, 3000);
  } catch { /* Analytics must never interrupt shopping. */ }
}
export async function flushAnalytics() {
  clearTimeout(timer); timer = undefined;
  if (busy || !queue.length || analyticsChoice() !== 'accepted') return;
  busy = true;
  const sessionId = queue[0].sessionId;
  const batch = queue.filter(e => e.sessionId === sessionId).slice(0, 20);
  const ids = new Set(batch.map(e => e.event.id));
  queue = queue.filter(e => !ids.has(e.event.id));
  try {
    const token = await auth.currentUser?.getIdToken();
    if (analyticsChoice() !== 'accepted') return;
    const response = await fetch('/api/events', { method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ sessionId, consent: true, events: batch.map(e => e.event) }) });
    if (!response.ok) throw new Error('Analytics unavailable');
    failures = 0;
  } catch { if (failures++ < 2 && analyticsChoice() === 'accepted') queue = [...batch, ...queue].slice(0, 60); }
  finally { busy = false; if (queue.length && analyticsChoice() === 'accepted') timer = setTimeout(flushAnalytics, 10000); }
}
