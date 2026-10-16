import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeEvent, publicPath, safeUrl, summarize } from '../server/growth-model.js';
import { allowedAdmin, isCron, originCheck } from '../server/growth-store.js';
import { runResearch } from '../server/growth-research.js';
import growthHandler from '../api/growth.js';
import eventHandler from '../api/events.js';
import cronHandler from '../api/growth-cron.js';

const event = { id: '12345678-1234-1234-1234-123456789abc', type: 'page_view', path: '/shop' };
test('only approved public paths and event fields survive sanitization', () => {
  const clean = sanitizeEvent({ ...event, path: '/shop?email=private@example.com', email: 'private@example.com', password: 'secret', text: 'typed input', seconds: 99999, quantity: -10, device: 'unknown custom fingerprint', userId: 'forged' });
  assert.equal(clean.path, '/shop'); assert.equal(clean.seconds, 1800); assert.equal(clean.quantity, 1);
  for (const field of ['email', 'password', 'text', 'userId']) assert.equal(field in clean, false);
  assert.equal(clean.device, 'unknown');
  for (const path of ['/profile/secret', '/messages', '/admin/growth', '/account', '//attacker.example']) assert.equal(sanitizeEvent({ ...event, path }), null);
  assert.equal(publicPath('/product/top-raglan-green?utm_source=ig'), '/product/top-raglan-green');
  assert.equal(sanitizeEvent({ ...event, type: 'purchase' }), null);
  assert.equal(sanitizeEvent({ ...event, id: '../invalid' }), null);
});
test('only HTTPS result links can be saved', () => {
  assert.equal(safeUrl('javascript:alert(1)'), null); assert.equal(safeUrl('data:text/html,test'), null);
  assert.equal(safeUrl('https://example.com/creator'), 'https://example.com/creator');
});
test('funnel preserves order and revenue ignores customer paid claims', () => {
  const steps = ['page_view', 'product_view', 'add_to_cart', 'checkout_start', 'order_created'];
  const events = steps.map((type, i) => ({ ...event, id: `a${i}`, sessionId: 'a', at: i, type, source: 'instagram' }));
  events.push({ ...event, sessionId: 'b', at: 10, type: 'add_to_cart' }, { ...event, sessionId: 'b', at: 11, type: 'page_view' });
  const orders = [{ id: 'pending', total: 45000, status: 'paid' }, { id: 'paid', total: 25000 }, { id: 'refunded', total: 30000 }];
  const result = summarize(events.reverse(), orders, [{ id: 'paid', status: 'paid', amount: 24000 }, { id: 'refunded', status: 'refunded', amount: 0 }]);
  assert.deepEqual(result.funnel.map(s => s.count), [2, 1, 1, 1, 1]);
  assert.equal(result.totals.revenue, 24000); assert.equal(result.totals.paidOrders, 1); assert.equal(result.totals.orders, 3);
  assert.equal(result.sources.find(s => s.name.startsWith('instagram')).sessions, 1);
});
test('owner access requires verified owner email, trusted UID, or server claim', () => {
  process.env.GROWTH_ADMIN_EMAILS = 'owner@example.com'; process.env.GROWTH_ADMIN_UIDS = 'trusted-uid';
  assert.equal(allowedAdmin({ uid: 'other', email: 'owner@example.com', email_verified: false }), false);
  assert.equal(allowedAdmin({ uid: 'other', email: 'owner@example.com', email_verified: true }), true);
  assert.equal(allowedAdmin({ uid: 'other', email: 'customer@example.com', email_verified: true }), false);
  assert.equal(allowedAdmin({ uid: 'trusted-uid' }), true); assert.equal(allowedAdmin({ uid: 'other', admin: true }), true);
  delete process.env.GROWTH_ADMIN_EMAILS; delete process.env.GROWTH_ADMIN_UIDS;
});
test('cron fails closed without its secret; collector rejects foreign origins', () => {
  delete process.env.CRON_SECRET; assert.equal(isCron({ headers: { authorization: 'Bearer undefined' } }), false);
  process.env.CRON_SECRET = 'test-secret';
  assert.equal(isCron({ headers: { authorization: 'Bearer wrong' } }), false);
  assert.equal(isCron({ headers: { authorization: 'Bearer test-secret' } }), true);
  process.env.SITE_URL = 'https://shop.example.com';
  assert.throws(() => originCheck({ headers: { origin: 'https://foreign.example.com' } }), /origin/);
  assert.doesNotThrow(() => originCheck({ headers: { origin: 'https://shop.example.com' } }));
});
function response() { return { code: 200, data: null, setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } }; }
test('private admin endpoints reject missing authentication before reading data', async () => {
  for (const method of ['GET', 'POST']) { const res = response(); await growthHandler({ method, headers: {}, query: {}, body: { action: 'review_order' } }, res); assert.equal(res.code, 401); }
});
test('event collector rejects malformed payloads and cron rejects unauthenticated runs', async () => {
  const res = response(); await eventHandler({ method: 'POST', headers: { origin: 'https://shop.example.com' }, body: { consent: false, sessionId: event.id, events: [event] } }, res); assert.equal(res.code, 400);
  const cron = response(); await cronHandler({ method: 'GET', headers: {} }, cron); assert.equal(cron.code, 401);
});

function fakeStore() {
  const rows = new Map(); let sequence = 0; let lock = Promise.resolve();
  const reference = path => ({ path, async get() { return { exists: rows.has(path), data: () => structuredClone(rows.get(path)) }; }, async set(value) { rows.set(path, structuredClone(value)); }, async update(value) { rows.set(path, { ...rows.get(path), ...structuredClone(value) }); } });
  return { rows, collection(name) { return { doc(id = `id-${sequence++}`) { return reference(`${name}/${id}`); } }; },
    runTransaction(fn) {
      const next = lock.then(() => fn({ get: ref => ref.get(), set: (ref, v) => rows.set(ref.path, v), create: (ref, v) => rows.set(ref.path, v), update: (ref, v) => rows.set(ref.path, { ...rows.get(ref.path), ...v }) }));
      lock = next.catch(() => {}); return next;
    },
  };
}
const resultFetcher = async () => ({ ok: true, json: async () => ({ organic_results: [{ title: 'Public fashion event', link: 'https://example.com/event', snippet: 'Vendor information' }, { title: 'Unsafe', link: 'javascript:bad()' }] }) });
test('research is paused by default and does not call a paid provider', async () => {
  const store = fakeStore(); let calls = 0;
  const result = await runResearch({ scheduled: true, store, fetcher: () => { calls++; } });
  assert.equal(result.skipped, true); assert.equal(calls, 0);
});
test('daily scheduled deduplication and shared quota survive concurrent requests', async () => {
  process.env.SERPAPI_API_KEY = 'test-key'; process.env.RESEARCH_DAILY_LIMIT = '2';
  const store = fakeStore(); store.rows.set('_growth_settings/workspace', { enabled: true, focus: 'Pop-up markets' });
  const results = await Promise.allSettled([runResearch({ scheduled: true, store, fetcher: resultFetcher }), runResearch({ scheduled: true, store, fetcher: resultFetcher })]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.status, 409);
  const key = [...store.rows.keys()].find(k => k.startsWith('_growth_opportunities/'));
  store.rows.set(key, { ...store.rows.get(key), status: 'shortlisted', notes: 'Keep these notes' });
  await runResearch({ store, fetcher: resultFetcher });
  assert.equal(store.rows.get(key).notes, 'Keep these notes'); assert.equal(store.rows.get(key).status, 'shortlisted');
  await assert.rejects(runResearch({ store, fetcher: resultFetcher }), error => error.status === 429);
  assert.equal([...store.rows.keys()].filter(k => k.startsWith('_growth_opportunities/')).length, 1);
});
test('failed search consumes quota and never returns provider secrets', async () => {
  const store = fakeStore(); process.env.RESEARCH_DAILY_LIMIT = '1';
  await assert.rejects(runResearch({ store, fetcher: async () => { throw new Error('sensitive provider text'); } }), error => error.status === 502 && !error.message.includes('sensitive'));
  await assert.rejects(runResearch({ store, fetcher: resultFetcher }), error => error.status === 429);
  assert.equal([...store.rows.values()].find(r => r.status === 'failed').error.includes('test-key'), false);
});
