import test from 'node:test';
import assert from 'node:assert/strict';
import { isSong, privateFields, profileFields, recordScan, scanSummary, songsFirst, workLink } from '../server/profile-model.js';
import { protectProfiles, saveScan } from '../server/profile-store.js';
import scanHandler from '../api/profile-scans.js';

function fakeDb(profiles = {}) {
  const rows = new Map(Object.entries(profiles).map(([id, value]) => [`digitalProfiles/${id}`, value]));
  const ref = path => ({ path, id: path.split('/')[1], async get() { return { exists: rows.has(path), data: () => rows.get(path) }; } });
  return { rows,
    collection: name => ({ doc: id => ref(`${name}/${id}`), async get() { return { docs: [...rows.keys()].filter(k => k.startsWith(`${name}/`)).map(k => ({ ...ref(k), ref: ref(k), data: () => rows.get(k) })) }; } }),
    runTransaction: fn => fn({ get: r => r.get(), set: (r, value) => rows.set(r.path, value) }),
    batch() { const writes = []; return { set: (r, value) => writes.push(() => rows.set(r.path, { ...rows.get(r.path), ...value })), update: (r, value) => writes.push(() => { const next = { ...rows.get(r.path) }; for (const [key, v] of Object.entries(value)) { if (v === REMOVE) delete next[key]; else next[key] = v; } rows.set(r.path, next); }), async commit() { writes.forEach(write => write()); } }; } };
}
const REMOVE = Symbol('remove');

test('a new profile never stores the account email, and stores a phone only by choice', () => {
  const hidden = profileFields({ name: 'Ada', phone: '08030000000', userEmail: 'ada@example.com' });
  assert.equal(hidden.phone, ''); assert.equal(hidden.showPhone, false); assert.equal('userEmail' in hidden, false);
  assert.equal(profileFields({ name: 'Ada', phone: '08030000000', showPhone: true }).phone, '08030000000');
});
test('files still uploading are not saved to a profile', () => {
  assert.deepEqual(profileFields({ craftFiles: [{ url: 'blob:x', status: 'uploading' }, { url: 'https://a.example/1.jpg' }] }).craftFiles, [{ url: 'https://a.example/1.jpg' }]);
});
test('work with me turns each contact type into a safe link', () => {
  assert.equal(workLink({ workContact: 'ada@example.com' }), 'mailto:ada@example.com');
  assert.equal(workLink({ workContact: '0803 000 0000' }), 'https://wa.me/2348030000000');
  assert.equal(workLink({ workContact: '+234 803 000 0000' }), 'https://wa.me/2348030000000');
  assert.equal(workLink({ workContact: 'adastudio.com/book' }), 'https://adastudio.com/book');
  assert.equal(workLink({ igHandle: '@ada.makes' }), 'https://ig.me/m/ada.makes');
  assert.equal(workLink({ website: 'adastudio.com' }), 'https://adastudio.com/');
  assert.equal(workLink({}), null);
  for (const workContact of ['javascript:alert(1)', 'data:text/html,bad', 'JaVaScRiPt:alert(1)']) assert.equal(workLink({ workContact }), null);
  assert.equal(workLink({ workContact: 'javascript:alert(1)', igHandle: 'ada' }), 'https://ig.me/m/ada');
});
test('only details the wearer did not choose to show are treated as private', () => {
  assert.deepEqual(privateFields({ userEmail: 'a@b.co', phone: '080' }), { userEmail: 'a@b.co', phone: '080' });
  assert.deepEqual(privateFields({ phone: '080', showPhone: true }), {});
  assert.deepEqual(privateFields({ name: 'Ada' }), {});
});
test('old profiles lose private details from the public record without losing them', async () => {
  const db = fakeDb({ old: { name: 'Old', userEmail: 'old@example.com', phone: '080' }, chosen: { name: 'Chosen', phone: '081', showPhone: true }, clean: { name: 'Clean' } });
  assert.equal(await protectProfiles(db, () => REMOVE), 1);
  assert.deepEqual(db.rows.get('digitalProfiles/old'), { name: 'Old' });
  assert.equal(db.rows.get('digitalProfiles/chosen').phone, '081');
  const saved = db.rows.get('_growth_profile_private/old');
  assert.equal(saved.userEmail, 'old@example.com'); assert.equal(saved.phone, '080');
  assert.equal(await protectProfiles(db, () => REMOVE), 0);
});
test('scan totals add up by week and old days are dropped', () => {
  const now = Date.UTC(2026, 10, 4, 12);
  const stats = recordScan({ total: 5, days: { '2026-11-01': 2, '2026-10-20': 3, '2026-01-01': 9 } }, now);
  assert.equal(stats.total, 6); assert.equal(stats.days['2026-11-04'], 1); assert.equal('2026-01-01' in stats.days, false);
  assert.deepEqual(scanSummary(stats, now), { total: 6, week: 3 });
  assert.deepEqual(scanSummary(undefined, now), { total: 0, week: 0 });
});
test('scans only count for profiles that exist', async () => {
  const db = fakeDb({ real: { name: 'Real' } });
  await saveScan(db, 'real'); await saveScan(db, 'real');
  assert.equal(db.rows.get('_growth_profile_scans/real').total, 2);
  await assert.rejects(saveScan(db, 'missing'), error => error.status === 404);
  assert.equal(db.rows.has('_growth_profile_scans/missing'), false);
});
test('scan endpoint rejects other methods, other sites and signed-out totals', async () => {
  process.env.SITE_URL = 'https://shop.example.com';
  const call = async req => { const out = {}; const res = { setHeader() {}, status(code) { out.status = code; return this; }, json(data) { out.data = data; return this; } }; await scanHandler({ headers: {}, ...req }, res); return out; };
  assert.equal((await call({ method: 'DELETE' })).status, 405);
  assert.equal((await call({ method: 'POST', headers: { origin: 'https://evil.example' }, body: { id: 'real' } })).status, 403);
  assert.equal((await call({ method: 'POST', headers: { origin: 'https://shop.example.com' }, body: { id: '../bad' } })).status, 400);
  assert.equal((await call({ method: 'GET' })).status, 401);
});

test('songs are recognised and listed before other work', () => {
  assert.equal(isSong({ type: 'audio/mpeg', name: 'a' }), true);
  assert.equal(isSong({ name: 'demo.MP3' }), true);
  assert.equal(isSong({ type: 'image/jpeg', name: 'a.jpg' }), false);
  assert.equal(isSong(undefined), false);
  const files = [{ name: 'a.jpg', type: 'image/jpeg' }, { name: 'b.mp3', type: 'audio/mpeg' }, { name: 'c.jpg', type: 'image/jpeg' }];
  assert.deepEqual(songsFirst(files).map(file => file.name), ['b.mp3', 'a.jpg', 'c.jpg']);
  assert.deepEqual(songsFirst(undefined), []);
});
