import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { audience, optOutRef, saveLetterEdit, sendLetters, sendMissed, sendNow, sendTest, unsubscribeToken, unsubscribeUrl, validUnsubscribe } from '../server/email-store.js';
import { buildLetter, cleanLetterEdit, EDITION_NAMES, letterFields, letterPool, pickProducts } from '../server/weekly-letter.js';
import { cleanApplication, publicPerson, setFeatured, featuredPeople, slumBookEntry } from '../server/community-store.js';
import { publicPath } from '../server/growth-model.js';
import { PRODUCTS } from '../src/data/products.js';
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
test('all accounts receive it once, except people who opted out or were disabled', async () => {
  const db = fakeDb({ 'subscribers/a@x.co': { email: 'a@x.co' }, 'subscribers/old@x.co': { email: 'old@x.co' }, 'subscribers/gone@x.co': { email: 'gone@x.co', unsubscribed: true } });
  await optOutRef(db, 'left@x.co').set({ at: 1 });
  const users = [{ email: 'A@x.co', displayName: 'Ada Obi' }, { email: 'new@x.co' }, { email: 'left@x.co' }, { email: 'banned@x.co', disabled: true }, { displayName: 'Phone only' }];
  const people = await audience(db, fakeAuth(users));
  assert.deepEqual(people.map(p => p.email).sort(), ['a@x.co', 'new@x.co', 'old@x.co']);
  assert.equal(people.find(p => p.email === 'a@x.co').firstName, 'Ada');
});
test('each email has its own one-click unsubscribe and large lists are split', async () => {
  const { calls, fetcher } = recorder();
  const recipients = Array.from({ length: 150 }, (_, i) => ({ email: `p${i}@x.co`, firstName: '' }));
  assert.deepEqual(await sendLetters(recipients, 1, PRODUCTS, { fetcher, pause: 0 }), { sent: 150, failed: 0, missed: [] });
  assert.equal(calls.length, 2); assert.equal(calls[0].body.length, 100);
  const one = calls[0].body[3];
  assert.equal(one.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.ok(one.headers['List-Unsubscribe'].includes(encodeURIComponent('p3@x.co')));
  assert.ok(one.html.includes(unsubscribeToken('p3@x.co')));
  assert.deepEqual(one.to, ['p3@x.co']);
});
test('failed batches are reported, not hidden', async () => {
  const result = await sendLetters([{ email: 'a@x.co', firstName: '' }], 1, PRODUCTS, { fetcher: async () => ({ ok: false }), pause: 0 });
  assert.deepEqual([result.sent, result.failed, result.missed[0].email], [0, 1, 'a@x.co']);
});
test('unsubscribe links only work for the address they were made for', () => {
  const token = unsubscribeToken('a@x.co');
  assert.equal(validUnsubscribe('a@x.co', token), true); assert.equal(validUnsubscribe('A@X.CO', token), true);
  assert.equal(validUnsubscribe('b@x.co', token), false); assert.equal(validUnsubscribe('a@x.co', 'wrong'), false);
  assert.match(unsubscribeUrl('a@x.co'), /^https:\/\/shop\.example\.com\/api\/unsubscribe\?e=a%40x\.co&t=/);
});
const call = async (handler, req) => { const out = { headers: {} }; const res = { setHeader(k, v) { out.headers[k] = v; }, status(code) { out.status = code; return this; }, json(data) { out.data = data; return this; }, end(data) { out.body = data; return this; } }; await handler({ headers: {}, query: {}, ...req }, res); return out; };
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

test('the owner can reword an edition, and what they type stays safe', () => {
  const edits = { 'The Stranger': { subject: 'New drop', headline: 'Big <b>news</b>', copy: 'Line one\nLine two <script>', ctaLabel: 'Shop now', ctaLink: '/shop' } };
  const letter = buildLetter({ issue: 1, edits, products: [], siteUrl: 'https://s.example', unsubscribeUrl: 'https://s.example/u' });
  assert.equal(letter.subject, 'New drop');
  assert.match(letter.html, /Big &lt;b&gt;news&lt;\/b&gt;/); assert.match(letter.html, /Line one<br\/>Line two &lt;script&gt;/);
  assert.equal(letter.html.includes('<script>'), false);
  assert.match(letter.html, /Shop now/); assert.match(letter.html, /https:\/\/s\.example\/shop\?/); assert.match(letter.text, /Line one\nLine two/);
  assert.equal(letterFields('Wanted').headline, 'WANTED');
});
test('every edition shows its editable headline', () => {
  EDITION_NAMES.forEach((name, edition) => {
    const letter = buildLetter({ issue: 3, edition, edits: { [name]: { headline: 'Changed headline' } }, products: [], siteUrl: 'https://s.example', unsubscribeUrl: 'https://s.example/u' });
    assert.equal(letter.edition, name); assert.match(letter.html, /Changed headline/);
  });
});
test('saved edits only keep real changes and bad links are refused', async () => {
  assert.deepEqual(cleanLetterEdit('Wanted', { ...letterFields('Wanted'), subject: ' Hello ' }), { subject: 'Hello' });
  assert.equal(cleanLetterEdit('Nope', {}), null);
  assert.equal(cleanLetterEdit('Wanted', { ctaLink: 'javascript:alert(1)' }), null);
  const db = fakeDb();
  await saveLetterEdit(db, 'Wanted', { ...letterFields('Wanted'), subject: 'Hello' });
  assert.equal(db.rows.get('_growth_settings/letter_edits').editions.Wanted.subject, 'Hello');
  await saveLetterEdit(db, 'Wanted', {});
  assert.equal('Wanted' in db.rows.get('_growth_settings/letter_edits').editions, false);
  await assert.rejects(saveLetterEdit(db, 'Wanted', { ctaLink: 'https://elsewhere.example' }), error => error.status === 400);
});
test('send now reaches everyone once, uses edits, and a double press is refused', async () => {
  const db = fakeDb({ '_growth_settings/letter_edits': { editions: { 'Admit One': { subject: 'Doors open' } } } });
  const { calls, fetcher } = recorder();
  const users = [{ email: 'a@x.co' }, { email: 'b@x.co' }];
  const result = await sendNow(db, fakeAuth(users), PRODUCTS, 2, { now: 1000000, fetcher, pause: 0 });
  assert.deepEqual([result.recipients, result.sent, result.failed], [2, 2, 0]);
  assert.equal(calls.length, 1); assert.equal(calls[0].body.length, 2); assert.equal(calls[0].body[0].subject, 'Doors open');
  await assert.rejects(sendNow(db, fakeAuth(users), PRODUCTS, 2, { now: 1000000 + 60000, fetcher, pause: 0 }), error => error.status === 429);
  assert.equal(calls.length, 1);
  assert.equal((await sendNow(db, fakeAuth(users), PRODUCTS, 2, { now: 1000000 + 11 * 60000, fetcher, pause: 0 })).sent, 2);
  assert.notEqual(calls[0].options.headers['Idempotency-Key'], calls[1].options.headers['Idempotency-Key']);
});
test('send now skips people who unsubscribed', async () => {
  const db = fakeDb();
  await optOutRef(db, 'b@x.co').set({ at: 1 });
  const { calls, fetcher } = recorder();
  await sendNow(db, fakeAuth([{ email: 'a@x.co' }, { email: 'b@x.co' }]), PRODUCTS, 0, { now: 5000000, fetcher, pause: 0 });
  assert.deepEqual(calls[0].body.map(mail => mail.to[0]), ['a@x.co']);
});
test('a send that reaches nobody can be tried again straight away', async () => {
  const db = fakeDb();
  const fetcher = async () => ({ ok: false });
  const first = await sendNow(db, fakeAuth([{ email: 'a@x.co' }]), PRODUCTS, 0, { now: 9000000, fetcher, pause: 0 });
  assert.equal(first.failed, 1);
  assert.equal((await sendNow(db, fakeAuth([{ email: 'a@x.co' }]), PRODUCTS, 0, { now: 9000000 + 1000, fetcher, pause: 0 })).failed, 1);
});
test('the test letter uses saved edits and the chosen edition', async () => {
  const db = fakeDb({ '_growth_settings/letter_edits': { editions: { Wanted: { subject: 'Edited' } } } });
  const { calls, fetcher } = recorder();
  await sendTest(db, 'owner@x.co', 'Owner Name', 4, PRODUCTS, { now: 7, fetcher });
  assert.equal(calls[0].body[0].subject, 'Edited'); assert.deepEqual(calls[0].body[0].to, ['owner@x.co']);
});

test('nothing is on a schedule, and letters can go out as often as the owner likes', async () => {
  assert.equal(readFileSync('vercel.json', 'utf8').includes('weekly-email'), false);
  const db = fakeDb();
  const { calls, fetcher } = recorder();
  const users = [{ email: 'a@x.co' }];
  for (let send = 0; send < 3; send++) await sendNow(db, fakeAuth(users), PRODUCTS, send, { now: 1000000 + send * 86400000, fetcher, pause: 0 });
  assert.equal(calls.length, 3);
  assert.deepEqual(calls.map(call => /Nº (\d+)/.exec(call.body[0].html)[1]), ['1', '2', '3']);
});

test('the owner can swap the clothes, and a piece that sells out drops away', () => {
  const [a, b, c] = letterPool(PRODUCTS);
  assert.deepEqual(pickProducts(PRODUCTS, 1, [b.id, a.id]).map(p => p.id), [b.id, a.id]);
  const soldOut = PRODUCTS.map(p => p.id === b.id ? { ...p, inStock: false } : p);
  assert.deepEqual(pickProducts(soldOut, 1, [b.id, a.id]).map(p => p.id), [a.id]);
  assert.equal(pickProducts(soldOut, 1, [b.id]).length, 2);
  assert.equal(pickProducts(PRODUCTS, 1, ['not-a-real-piece']).length, 2);
  assert.deepEqual(cleanLetterEdit('Wanted', { ...letterFields('Wanted'), products: [a.id, a.id, b.id, c.id] }).products, [a.id, b.id]);
  assert.equal('products' in cleanLetterEdit('Wanted', { ...letterFields('Wanted'), products: ['<bad>'] }), false);
});
test('tests and sends use the clothes picked for that edition', async () => {
  const [, , , one, two] = letterPool(PRODUCTS);
  const db = fakeDb();
  await saveLetterEdit(db, 'Wanted', { ...letterFields('Wanted'), products: [one.id, two.id] });
  const { calls, fetcher } = recorder();
  await sendTest(db, 'owner@x.co', 'Owner', 4, PRODUCTS, { now: 1, fetcher });
  await sendNow(db, fakeAuth([{ email: 'a@x.co' }]), PRODUCTS, 4, { now: 2000000, fetcher, pause: 0 });
  for (const call of calls) { assert.match(call.body[0].html, new RegExp(`/product/${one.id}\\?`)); assert.match(call.body[0].html, new RegExp(`/product/${two.id}\\?`)); }
  await sendNow(db, fakeAuth([{ email: 'a@x.co' }]), PRODUCTS, 0, { now: 3000000, fetcher, pause: 0 });
  assert.equal(calls[2].body[0].html.includes(`/product/${one.id}?`) && calls[2].body[0].html.includes(`/product/${two.id}?`), false);
});

test('fake test addresses never reach the send list', async () => {
  const db = fakeDb({ 'subscribers/fake@example.com': { email: 'fake@example.com' }, 'subscribers/old@x.co': { email: 'old@x.co' } });
  const people = await audience(db, fakeAuth([{ email: 'a@x.co' }, { email: 'b@sub.example.org' }, { email: 'c@site.test' }]));
  assert.deepEqual(people.map(p => p.email).sort(), ['a@x.co', 'old@x.co']);
  assert.equal(people.find(p => p.email === 'old@x.co').account, false);
});
// Behaves like Resend: one refused address fails the whole batch it is in.
const pickyFetcher = (bad, calls = []) => async (url, options) => { const mails = JSON.parse(options.body); calls.push(mails.length); return mails.some(mail => mail.to[0] === bad) ? { ok: false, status: 422 } : { ok: true, status: 200 }; };
test('one refused address no longer takes the rest of the batch down with it', async () => {
  const recipients = Array.from({ length: 30 }, (_, i) => ({ email: `p${i}@x.co`, firstName: '' }));
  const result = await sendLetters(recipients, 1, PRODUCTS, { fetcher: pickyFetcher('p17@x.co'), pause: 0 });
  assert.deepEqual([result.sent, result.failed, result.missed[0].email], [29, 1, 'p17@x.co']);
});
test('a daily limit stops the send but remembers who missed it, then they can be finished', async () => {
  const db = fakeDb();
  const users = [{ email: 'a@x.co' }, { email: 'b@x.co' }];
  const blocked = async () => ({ ok: false, status: 429 });
  const first = await sendNow(db, fakeAuth(users), PRODUCTS, 1, { now: 1000000, fetcher: blocked, pause: 0 });
  assert.deepEqual([first.sent, first.failed, 'missed' in first], [0, 2, false]);
  const id = 'letter-1000000';
  assert.equal(db.rows.get(`_growth_email_runs/${id}`).missed.length, 2);
  await optOutRef(db, 'b@x.co').set({ at: 1 });
  const { calls, fetcher } = recorder();
  const again = await sendMissed(db, fakeAuth(users), PRODUCTS, id, { now: 2000000, fetcher, pause: 0 });
  assert.deepEqual([again.recipients, again.sent, again.failed], [1, 1, 0]);
  assert.deepEqual(calls[0].body.map(mail => mail.to[0]), ['a@x.co']);
  assert.match(calls[0].body[0].html, /The Receipt/);
  assert.equal(db.rows.get(`_growth_email_runs/${id}`).status, 'sent');
  await assert.rejects(sendMissed(db, fakeAuth(users), PRODUCTS, id, { now: 3000000, fetcher, pause: 0 }), error => error.status === 400);
});
test('a letter from before missed people were recorded picks up after the sent count', async () => {
  const db = fakeDb({ '_growth_email_runs/old': { issue: 1, edition: 5, sent: 1, failed: 1, status: 'partial' } });
  const { calls, fetcher } = recorder();
  await sendMissed(db, fakeAuth([{ email: 'a@x.co' }, { email: 'b@x.co' }]), PRODUCTS, 'old', { now: 4000000, fetcher, pause: 0 });
  assert.deepEqual(calls[0].body.map(mail => mail.to[0]), ['b@x.co']);
});
