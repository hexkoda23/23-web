import { createHmac, timingSafeEqual } from 'node:crypto';
import { hash, HttpError } from './growth-store.js';
import { buildLetter, issueNumber, pickProducts } from './weekly-letter.js';

const RESEND = 'https://api.resend.com';
const siteUrl = () => (process.env.SITE_URL || 'https://www.shopfrom23.com').replace(/\/$/, '');
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
const firstName = value => (String(value || '').trim().split(/\s+/)[0] || '').replace(/[^\p{L}'-]/gu, '').slice(0, 30);
const sleep = ms => new Promise(done => setTimeout(done, ms));

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
function message(person, issue, products) {
  const link = unsubscribeUrl(person.email);
  const letter = buildLetter({ issue, firstName: person.firstName, products, siteUrl: siteUrl(), unsubscribeUrl: link });
  return { from: process.env.EMAIL_FROM, to: [person.email], subject: letter.subject, html: letter.html, text: letter.text,
    headers: { 'List-Unsubscribe': `<${link}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } };
}
export async function sendLetters(recipients, issue, catalog, { fetcher = fetch, pause = 600 } = {}) {
  const products = pickProducts(catalog, issue);
  let sent = 0;
  let failed = 0;
  for (let start = 0; start < recipients.length; start += 100) {
    const chunk = recipients.slice(start, start + 100);
    const response = await fetcher(`${RESEND}/emails/batch`, { method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Idempotency-Key': `issue-${issue}-${start}` },
      body: JSON.stringify(chunk.map(person => message(person, issue, products))) });
    if (response.ok) sent += chunk.length; else failed += chunk.length;
    if (pause && start + 100 < recipients.length) await sleep(pause);
  }
  return { sent, failed };
}
export async function sendTest(email, name, issue, catalog, fetcher = fetch) {
  if (!emailConfigured()) throw new HttpError(400, 'Connect Resend first: add RESEND_API_KEY and EMAIL_FROM, then redeploy.');
  const response = await fetcher(`${RESEND}/emails`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify(message({ email, firstName: firstName(name) }, issue, pickProducts(catalog, issue))) });
  if (!response.ok) throw new HttpError(502, 'Resend did not accept the test email. Check that your sending domain is verified.');
}
// One claim per issue: a retried schedule can never email people twice.
export async function runWeeklyLetter(db, auth, catalog, { now = Date.now(), fetcher, pause } = {}) {
  if ((await db.collection('_growth_settings').doc('email').get()).data()?.enabled !== true) return { skipped: 'paused' };
  const issue = issueNumber(now);
  const ref = db.collection('_growth_email_runs').doc(`issue-${issue}`);
  const claimed = await db.runTransaction(async tx => {
    if ((await tx.get(ref)).exists) return false;
    tx.set(ref, { issue, status: 'sending', startedAt: now });
    return true;
  });
  if (!claimed) return { skipped: 'already-sent', issue };
  const recipients = await audience(db, auth);
  const result = await sendLetters(recipients, issue, catalog, { fetcher, pause });
  await ref.set({ issue, status: result.failed ? 'partial' : 'sent', startedAt: now, finishedAt: Date.now(), recipients: recipients.length, ...result });
  return { issue, recipients: recipients.length, ...result };
}
export async function letterOverview(db) {
  const [settings, runs, optOuts] = await Promise.all([db.collection('_growth_settings').doc('email').get(), db.collection('_growth_email_runs').orderBy('issue', 'desc').limit(6).get(), db.collection('_growth_email_optouts').count().get()]);
  return { enabled: settings.data()?.enabled === true, optOuts: optOuts.data().count, runs: runs.docs.map(doc => doc.data()) };
}
