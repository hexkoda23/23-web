export const DEFAULT_SETTINGS = {
  enabled: false, market: 'Nigeria nationwide', monthlyBudget: 0,
  focus: 'Streetwear creators',
};
export const FOCUSES = ['Streetwear creators', 'Pop-up markets', 'Fashion retailers', 'Campus communities'];
export const EVENTS = ['page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'order_created', 'login', 'signup', 'logout', 'scroll_depth', 'page_engagement', 'navigation', 'whatsapp_click'];
export function publicPath(value) {
  const path = String(value || '').split(/[?#]/)[0];
  if (/^\/product\/[a-zA-Z0-9_-]{1,100}$/.test(path)) return path;
  return ['/', '/shop', '/lookbook', '/cart', '/checkout', '/login', '/signup', '/about', '/contact', '/faq', '/size-guide', '/ai-studio', '/outfit-generator'].includes(path) ? path : '/private';
}
const tag = (value, limit = 80) => String(value || '').replace(/[^a-zA-Z0-9 _./-]/g, '').slice(0, limit);
export function sanitizeEvent(input) {
  if (!input || !EVENTS.includes(input.type) || !/^[a-f0-9-]{36}$/.test(input.id || '')) return null;
  const path = publicPath(input.path);
  if (path === '/private') return null;
  return { id: input.id, type: input.type, path, productId: tag(input.productId, 100),
    destination: publicPath(input.destination), source: tag(input.source), medium: tag(input.medium), campaign: tag(input.campaign),
    device: ['mobile', 'tablet', 'desktop'].includes(input.device) ? input.device : 'unknown',
    depth: [25, 50, 75, 100].includes(input.depth) ? input.depth : 0,
    seconds: Math.min(1800, Math.max(0, Number(input.seconds) || 0)),
    quantity: Math.min(20, Math.max(1, Math.floor(Number(input.quantity) || 1))),
  };
}
export function safeUrl(value) {
  try { const u = new URL(value); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
}
export function researchQuery(settings, day = new Date().getUTCDate()) {
  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Enugu', 'Benin City', 'Kano'];
  const city = cities[day % cities.length];
  const terms = {
    'Streetwear creators': `${city} Nigeria streetwear fashion creator stylist collaboration`,
    'Pop-up markets': `${city} Nigeria fashion pop up market vendor application ${new Date().getUTCFullYear()}`,
    'Fashion retailers': `${city} Nigeria independent fashion boutique stockist streetwear`,
    'Campus communities': `${city} Nigeria university fashion society fashion event`,
  };
  return terms[settings.focus] || terms['Streetwear creators'];
}
export function summarize(events, orders, reviews) {
  const sessions = new Map();
  const pages = new Map();
  const products = new Map();
  const sources = new Map();
  for (const e of events) {
    if (!sessions.has(e.sessionId)) sessions.set(e.sessionId, { id: e.sessionId, events: [], authenticated: false });
    const session = sessions.get(e.sessionId);
    session.events.push(e); session.authenticated ||= e.authenticated;
    if (e.type === 'page_view') {
      pages.set(e.path, (pages.get(e.path) || 0) + 1);
      const source = `${e.source || 'direct'} / ${e.campaign || 'unattributed'}`;
      if (!sources.has(source)) sources.set(source, new Set());
      sources.get(source).add(e.sessionId);
    }
    if (e.productId && ['product_view', 'add_to_cart'].includes(e.type)) {
      if (!products.has(e.productId)) products.set(e.productId, { id: e.productId, views: 0, adds: 0 });
      products.get(e.productId)[e.type === 'product_view' ? 'views' : 'adds'] += 1;
    }
  }
  const reviewMap = new Map(reviews.map(r => [r.id, r]));
  const enriched = orders.map(o => ({ ...o, review: reviewMap.get(o.id) || null }));
  const paid = enriched.filter(o => o.review?.status === 'paid');
  const steps = ['page_view', 'product_view', 'add_to_cart', 'checkout_start', 'order_created'];
  // Each stage requires the earlier stages in the same session, in timestamp order.
  const funnel = steps.map(type => ({ type, count: 0 }));
  for (const s of sessions.values()) {
    s.events.sort((a, b) => a.at - b.at);
    let step = 0;
    for (const event of s.events) if (event.type === steps[step]) { funnel[step].count += 1; step += 1; }
  }
  return {
    totals: { sessions: sessions.size, pageViews: events.filter(e => e.type === 'page_view').length,
      logins: events.filter(e => e.type === 'login').length, signups: events.filter(e => e.type === 'signup').length,
      orders: orders.length, paidOrders: paid.length, revenue: paid.reduce((n, o) => n + o.review.amount, 0) },
    funnel, pages: [...pages].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views),
    products: [...products.values()].sort((a, b) => b.views - a.views),
    sources: [...sources].map(([name, ids]) => ({ name, sessions: ids.size })).sort((a, b) => b.sessions - a.sessions),
    journeys: [...sessions.values()].sort((a, b) => b.events.at(-1).at - a.events.at(-1).at).slice(0, 30), orders: enriched,
  };
}
