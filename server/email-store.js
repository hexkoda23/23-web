import { createHmac, timingSafeEqual } from 'node:crypto';
import { hash, HttpError } from './growth-store.js';
import { buildLetter, cleanLetterEdit, EDITION_NAMES, pickProducts } from './weekly-letter.js';

const RESEND = 'https://api.resend.com';
const siteUrl = () => (process.env.SITE_URL || 'https://www.shopfrom23.com').replace(/\/$/, '');
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
const firstName = value => (String(value || '').trim().split(/\s+/)[0] || '').replace(/[^\p{L}'-]/gu, '').slice(0, 30);
const sleep = ms => new Promise(done => setTimeout(done, ms));
const SEND_GAP = 10 * 60000;
const editsRef = db => db.collection('_growth_settings').doc('letter_edits');
const lockRef = db => db.collection('_growth_settings').doc('email_send_lock');

export const emailConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM && !!process.env.CRON_SECRET;
export function unsubscribeToken(email) {
  return createHmac('sha256', process.env.CRON_SECRET || '').update(`unsubscribe:${email.toLowerCase()}`).digest('hex');
}
export function validUnsubscribe(email, token) {
  if (!process.env.CRON_SECRET || !validEmail(email)) return false;
  const actual = Buffer.from(String(token || ''));
  const expected = Buffer.from(unsubscribeToken(email));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export const unsubscribeUrl = email => `${siteUrl()}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
export const optOutRef = (db, email) => db.collection('_growth_email_optouts').doc(hash(email.toLowerCase()));

async function allAccounts(auth) {
  const accounts = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    accounts.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);
  return accounts;
}
export async function audience(db, auth) {
  const [accounts, subscribers, optOuts] = await Promise.all([allAccounts(auth), db.collection('subscribers').get(), db.collection('_growth_email_optouts').get()]);
  const blocked = new Set(optOuts.docs.map(doc => doc.id));
  const people = new Map();
  for (const doc of subscribers.docs) {
    const { email, unsubscribed } = doc.data();
    const address = String(email || '').toLowerCase();
    if (unsubscribed) blocked.add(hash(address));
    if (validEmail(address)) people.set(address, { email: address, firstName: '' });
  }
  for (const user of accounts) {
    const address = String(user.email || '').toLowerCase();
    if (user.disabled) { people.delete(address); blocked.add(hash(address)); continue; }
    if (validEmail(address)) people.set(address, { email: address, firstName: firstName(user.displayName) });
  }
  return [...people.values()].filter(person => !blocked.has(hash(person.email)));
}
function message(person, issue, products, options = {}) {
  const link = unsubscribeUrl(person.email);
  const letter = buildLetter({ issue, ...options, firstName: person.firstName, products, siteUrl: siteUrl(), unsubscribeUrl: link });
  return { from: process.env.EMAIL_FROM, to: [person.email], subject: letter.subject, html: letter.html, text: letter.text,
    headers: { 'List-Unsubscribe': `<${link}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } };
}
export async function sendLetters(recipients, issue, catalog, { fetcher = fetch, pause = 600, edits, edition, runId = `issue-${issue}` } = {}) {
  const products = pickProducts(catalog, issue, edits?.[EDITION_NAMES[edition ?? (issue - 1) % EDITION_NAMES.length]]?.products);
  let sent = 0;
  let failed = 0;
  for (let start = 0; start < recipients.length; start += 100) {
    const chunk = recipients.slice(start, start + 100);
    const response = await fetcher(`${RESEND}/emails/batch`, { method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Idempotency-Key': `${runId}-${start}` },
      body: JSON.stringify(chunk.map(person => message(person, issue, products, { edits, edition }))) });
    if (response.ok) sent += chunk.length; else failed += chunk.length;
    if (pause && start + 100 < recipients.length) await sleep(pause);
  }
  return { sent, failed };
}
// Each letter that reached someone takes the next number, however often they go out.
const nextIssue = async db => (await db.collection('_growth_email_runs').get()).docs.filter(doc => doc.data().sent > 0).length + 1;
const savedEdits = async db => (await editsRef(db).get()).data()?.editions || {};
export async function saveLetterEdit(db, name, input) {
  const fields = cleanLetterEdit(name, input);
  if (!fields) throw new HttpError(400, 'Check the edition, and start the button link with / (for example /shop).');
  const editions = await savedEdits(db);
  if (Object.keys(fields).length) editions[name] = fields; else delete editions[name];
  await editsRef(db).set({ editions, updatedAt: Date.now() });
}
// The test goes through the same batch route as a real send, so it proves that route works.
export async function sendTest(db, email, name, edition, catalog, { now = Date.now(), fetcher = fetch } = {}) {
  if (!emailConfigured()) throw new HttpError(400, 'Connect Resend first: add RESEND_API_KEY and EMAIL_FROM, then redeploy.');
  const { failed } = await sendLetters([{ email, firstName: firstName(name) }], await nextIssue(db), catalog, { fetcher, pause: 0, edition, edits: await savedEdits(db), runId: `test-${now}` });
  if (failed) throw new HttpError(502, 'Resend did not accept the test email. Check that your sending domain is verified.');
}
// The owner's send-now button. The lock means a double press cannot email everyone twice.
export async function sendNow(db, auth, catalog, edition, { now = Date.now(), fetcher, pause } = {}) {
  if (!emailConfigured()) throw new HttpError(400, 'Connect Resend first: add RESEND_API_KEY and EMAIL_FROM, then redeploy.');
  const claimed = await db.runTransaction(async tx => {
    if (now - ((await tx.get(lockRef(db))).data()?.at || 0) < SEND_GAP) return false;
    tx.set(lockRef(db), { at: now });
    return true;
  });
  if (!claimed) throw new HttpError(429, 'A letter went out in the last 10 minutes. Wait a little before sending again.');
  const issue = await nextIssue(db);
  const runId = `letter-${now}`;
  const recipients = await audience(db, auth);
  const result = await sendLetters(recipients, issue, catalog, { fetcher, pause, edition, edits: await savedEdits(db), runId });
  await db.collection('_growth_email_runs').doc(runId).set({ issue, edition, status: result.failed ? (result.sent ? 'partial' : 'failed') : 'sent', startedAt: now, finishedAt: Date.now(), recipients: recipients.length, ...result });
  // A send that reached nobody should not block trying again.
  if (!result.sent) await lockRef(db).set({ at: 0 });
  return { recipients: recipients.length, ...result };
}
export async function letterOverview(db) {
  const [runs, optOuts, edits, issue] = await Promise.all([db.collection('_growth_email_runs').orderBy('startedAt', 'desc').limit(10).get(), db.collection('_growth_email_optouts').count().get(), savedEdits(db), nextIssue(db)]);
  return { nextIssue: issue, optOuts: optOuts.data().count, edits, runs: runs.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
}
