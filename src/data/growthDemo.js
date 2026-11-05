import { DEFAULT_SETTINGS, summarize } from '../../server/growth-model';
// Explicitly synthetic preview. Never written to the store's database.
export function growthDemo() {
  const now = Date.now();
  const events = ['page_view', 'product_view', 'add_to_cart', 'checkout_start', 'order_created'].map((type, i) => ({ id: `sample-${i}`, sessionId: 'sample-session', type, path: i ? '/product/top-raglan-green' : '/', productId: i ? 'top-raglan-green' : '', source: 'instagram', campaign: 'raglan-story', at: now - (5 - i) * 60000, authenticated: i > 2, device: 'mobile' }));
  return { ...summarize(events, [], []), settings: DEFAULT_SETTINGS, configured: { search: false, analytics: false, cron: false }, dailyLimit: 2, accounts: [], signatures: { truncated: false, rows: [{ id: 'twenty3', ref: 'T23-TWENTY', name: 'Sample wearer', craft: 'Stylist', city: 'Lagos', owner: '', url: 'https://www.shopfrom23.com/profile/twenty3', createdAt: now, scans: { total: 12, week: 3 } }] }, slumBook: { truncated: false, entries: [{ id: 'sample-1', name: 'Sample wearer', nickname: 'Sample', email: 'wearer@example.com', phone: '0800 000 0000', instagram: '@sample', x: '', snapchat: 'sample', linkedin: '', bio: 'A sample entry, not a real person.', crush: 'Sample crush', files: 2, at: now }] }, opportunities: [], runs: [], campaigns: [], siteUrl: 'https://23-web.vercel.app', days: 30, sampled: false };
}
