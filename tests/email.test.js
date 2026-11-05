import test from 'node:test';
import assert from 'node:assert/strict';
import { audience, optOutRef, runWeeklyLetter, sendLetters, unsubscribeToken, unsubscribeUrl, validUnsubscribe } from '../server/email-store.js';
import { buildLetter, EDITION_NAMES, issueNumber, pickProducts } from '../server/weekly-letter.js';
import { cleanApplication, publicPerson, setFeatured, featuredPeople, slumBookEntry } from '../server/community-store.js';
import { publicPath } from '../server/growth-model.js';
import { PRODUCTS } from '../src/data/products.js';
import weeklyHandler from '../api/weekly-email.js';
import unsubscribeHandler from '../api/unsubscribe.js';

process.env.CRON_SECRET = 'test-secret';
process.env.RESEND_API_KEY = 'test-key';
process.env.EMAIL_FROM = 'Twenty3 <letter@example.com>';
process.env.SITE_URL = 'https://shop.example.com';

function fakeDb(seed = {}) {
  const rows = new Map(Object.entries(seed));
  const ref = path => ({ path, id: path.split('/')[1], async get() { return { id: path.split('/')[1], exists: rows.has(path), data: () => rows.get(path) }; }, async set(value) { rows.set(path, value); } });
  return { rows, getAll: (...refs) => Promise.all(refs.map(r => r.get())),
    collection: name => ({ doc: id => ref(`${name}/${id}`), async get() { return { docs: [...rows.keys()].filter(k => k.startsWith(`${name}/`)).map(k => ({ id: k.split('/')[1], data: () => rows.get(k) })) }; } }),
    runTransaction: fn => fn({ get: r => r.get(), set: (r, value) => rows.set(r.path, value) }) };
}
const fakeAuth = users => ({ listUsers: async (limit, token) => token ? { users: users.slice(1) } : { users: users.slice(0, 1), pageToken: users.length > 1 ? 'next' : undefined } });
const recorder = () => { const calls = []; const fetcher = async (url, options) => { calls.push({ url, options, body: JSON.parse(options.body) }); return { ok: true }; }; return { calls, fetcher }; };
const render = issue => buildLetter({ issue, firstName: 'Ada', products: pickProducts(PRODUCTS, issue), siteUrl: 'https://shop.example.com', unsubscribeUrl: 'https://shop.example.com/api/unsubscribe?e=a&t=b' });

test('the product list loads on the server, which is what broke the old job', () => {
  assert.ok(PRODUCTS.length > 10);
});
test('six different editions rotate and then repeat', () => {
  const subjects = EDITION_NAMES.map((_, i) => render(i + 1).subject);
  assert.equal(new Set(subjects).size, 6);
  assert.equal(render(7).subject, render(1).subject);
});
test('every edition carries an unsubscribe link, address, plain text and absolute links', () => {
  EDITION_NAMES.forEach((_, i) => {
    const letter = render(i + 1);
    assert.match(letter.html, /Unsubscribe<\/a>/); assert.match(letter.html, /Lagos, Nigeria/); assert.match(letter.text, /Unsubscribe: https/);
    assert.equal(/(src|href)="\//.test(letter.html), false);
    assert.match(letter.html, /ada/i);
  });
});
test('names cannot inject markup into the email', () => {
  const letter = buildLetter({ issue: 1, firstName: '<img src=x>', products: [], siteUrl: 'https://s.example', unsubscribeUrl: 'https://s.example/u' });
  assert.equal(letter.html.includes('<img src=x>'), false);
});
test('issue numbers advance each Monday', () => {
  assert.equal(issueNumber(Date.UTC(2026, 10, 9, 10)), 1); assert.equal(issueNumber(Date.UTC(2026, 10, 16, 10)), 2);
  assert.equal(issueNumber(Date.UTC(2026, 10, 4)), 1);
});
test('all accounts receive it once, except people who opted out or were disabled', async () => {
  const db = fakeDb({ 'subscribers/a@x.co': { email: 'a@x.co' }, 'subscribers/old@x.co': { email: 'old@x.co' }, 'subscribers/gone@x.co': { email: 'gone@x.co', unsubscribed: true } });
  await optOutRef(db, 'left@x.co').set({ at: 1 });
  const users = [{ email: 'A@x.co', displayName: 'Ada Obi' }, { email: 'new@x.co' }, { email: 'left@x.co' }, { email: 'banned@x.co', disabled: true }, { displayName: 'Phone only' }];
  const people = await audience(db, fakeAuth(users));
  assert.deepEqual(people.map(p => p.email).sort(), ['a@x.co', 'new@x.co', 'old@x.co']);
  assert.equal(people.find(p => p.email === 'a@x.co').firstName, 'Ada');
});
test('nothing is sent until the owner turns it on', async () => {
  const { calls, fetcher } = recorder();
  const result = await runWeeklyLetter(fakeDb(), fakeAuth([{ email: 'a@x.co' }]), PRODUCTS, { fetcher, pause: 0 });
  assert.equal(result.skipped, 'paused'); assert.equal(calls.length, 0);
});
test('a retried schedule cannot email anyone twice', async () => {
  const db = fakeDb({ '_growth_settings/email': { enabled: true } });
  const { calls, fetcher } = recorder();
  const now = Date.UTC(2026, 10, 9, 10);
  const first = await runWeeklyLetter(db, fakeAuth([{ email: 'a@x.co' }]), PRODUCTS, { now, fetcher, pause: 0 });
  const second = await runWeeklyLetter(db, fakeAuth([{ email: 'a@x.co' }]), PRODUCTS, { now, fetcher, pause: 0 });
  assert.equal(first.sent, 1); assert.equal(second.skipped, 'already-sent'); assert.equal(calls.length, 1);
  assert.equal((await runWeeklyLetter(db, fakeAuth([{ email: 'a@x.co' }]), PRODUCTS, { now: now + 7 * 86400000, fetcher, pause: 0 })).sent, 1);
});
test('each email has its own one-click unsubscribe and large lists are split', async () => {
  const { calls, fetcher } = recorder();
  const recipients = Array.from({ length: 150 }, (_, i) => ({ email: `p${i}@x.co`, firstName: '' }));
  assert.deepEqual(await sendLetters(recipients, 1, PRODUCTS, { fetcher, pause: 0 }), { sent: 150, failed: 0 });
  assert.equal(calls.length, 2); assert.equal(calls[0].body.length, 100);
  const one = calls[0].body[3];
  assert.equal(one.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.ok(one.headers['List-Unsubscribe'].includes(encodeURIComponent('p3@x.co')));
  assert.ok(one.html.includes(unsubscribeToken('p3@x.co')));
  assert.deepEqual(one.to, ['p3@x.co']);
});
test('failed batches are reported, not hidden', async () => {
  const result = await sendLetters([{ email: 'a@x.co', firstName: '' }], 1, PRODUCTS, { fetcher: async () => ({ ok: false }), pause: 0 });
  assert.deepEqual(result, { sent: 0, failed: 1 });
});
test('unsubscribe links only work for the address they were made for', () => {
  const token = unsubscribeToken('a@x.co');
  assert.equal(validUnsubscribe('a@x.co', token), true); assert.equal(validUnsubscribe('A@X.CO', token), true);
  assert.equal(validUnsubscribe('b@x.co', token), false); assert.equal(validUnsubscribe('a@x.co', 'wrong'), false);
  assert.match(unsubscribeUrl('a@x.co'), /^https:\/\/shop\.example\.com\/api\/unsubscribe\?e=a%40x\.co&t=/);
});
const call = async (handler, req) => { const out = { headers: {} }; const res = { setHeader(k, v) { out.headers[k] = v; }, status(code) { out.status = code; return this; }, json(data) { out.data = data; return this; }, end(data) { out.body = data; return this; } }; await handler({ headers: {}, query: {}, ...req }, res); return out; };
test('the weekly job refuses anyone but the schedule', async () => {
  assert.equal((await call(weeklyHandler, { method: 'GET' })).status, 401);
  assert.equal((await call(weeklyHandler, { method: 'GET', query: { key: 'test-secret' } })).status, 401);
});
test('opening an unsubscribe link only asks, so mail scanners cannot unsubscribe people', async () => {
  const query = { e: 'a@x.co', t: unsubscribeToken('a@x.co') };
  const asked = await call(unsubscribeHandler, { method: 'GET', query });
  assert.equal(asked.status, 200); assert.match(asked.body, /method="post"/);
  assert.equal((await call(unsubscribeHandler, { method: 'POST', query: { e: 'a@x.co', t: 'bad' } })).status, 400);
});
test('First 23 applications need the essentials', () => {
  assert.throws(() => cleanApplication({ name: 'Ada', email: 'nope', craft: 'DJ' }), error => error.status === 400);
  assert.equal(cleanApplication({ name: ' Ada ', email: 'A@X.co', craft: 'DJ', extra: 'x' }).email, 'a@x.co');
  assert.equal('extra' in cleanApplication({ name: 'Ada', email: 'a@x.co', craft: 'DJ', extra: 'x' }), false);
});
test('the homepage only shows people the owner approved, and no private fields', async () => {
  const profile = { name: 'Ada', craft: 'DJ', userEmail: 'a@x.co', phone: '080', userId: 'u', craftFiles: [{ url: 'https://c.example/a.jpg', type: 'image/jpeg' }] };
  const db = fakeDb({ 'digitalProfiles/ok': profile, 'digitalProfiles/asked': { ...profile, wantsFeature: true } });
  assert.deepEqual(await featuredPeople(db), []);
  await setFeatured(db, 'ok', true);
  const people = await featuredPeople(db);
  assert.equal(people.length, 1); assert.deepEqual(Object.keys(people[0]).sort(), ['city', 'craft', 'id', 'image', 'name']);
  await setFeatured(db, 'ok', false);
  assert.deepEqual(await featuredPeople(db), []);
  assert.equal(publicPerson('x', { name: 'No work', craftFiles: [{ url: 'javascript:alert(1)' }] }), null);
});
test('Slum Book entries are flattened for the owner and drop the QR image', () => {
  const entry = slumBookEntry('s1', { userEmail: 'a@x.co', qrCodeUrl: 'data:image/png;base64,AAAA', submittedAt: { toMillis: () => 5 }, formData: { name: ' Ada ', phone: '080', igHandle: '@ada', craftFilesCount: 2 } });
  assert.equal(entry.name, 'Ada'); assert.equal(entry.phone, '080'); assert.equal(entry.instagram, '@ada'); assert.equal(entry.files, 2); assert.equal(entry.at, 5);
  assert.equal('qrCodeUrl' in entry, false);
  assert.equal(slumBookEntry('s2', {}).name, '');
});
test('the creatives page is trackable', () => { assert.equal(publicPath('/creatives'), '/creatives'); });
