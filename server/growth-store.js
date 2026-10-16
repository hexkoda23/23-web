import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { createHash, timingSafeEqual } from 'node:crypto';

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export function database() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw new HttpError(503, 'Connect Firebase Admin to enable the growth workspace.');
  if (process.env.GROWTH_STORAGE_READY !== 'true') throw new HttpError(503, 'Protect the growth collections with the documented database rules, then set GROWTH_STORAGE_READY=true.');
  if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  return getFirestore();
}
export function allowedAdmin(token) {
  const ids = (process.env.GROWTH_ADMIN_UIDS || '').split(',').map(v => v.trim());
  const emails = (process.env.GROWTH_ADMIN_EMAILS || 'kehindeadeleke92@gmail.com').split(',').map(v => v.trim().toLowerCase());
  return token.admin === true || ids.filter(Boolean).includes(token.uid) || (token.email_verified === true && emails.includes(token.email?.toLowerCase()));
}
export async function verifyUser(req) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new HttpError(401, 'Sign in to continue.');
  database();
  try { return await getAuth().verifyIdToken(token, true); } catch { throw new HttpError(401, 'Your sign-in expired. Sign in again.'); }
}
export async function requireAdmin(req) {
  const user = await verifyUser(req);
  if (!allowedAdmin(user)) throw new HttpError(403, 'Owner access required. Verify your owner email, then refresh your access.');
  return user;
}
export function isCron(req) {
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(req.headers.authorization || '');
  const expected = Buffer.from(`Bearer ${secret || ''}`);
  return !!secret && actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function hash(value) { return createHash('sha256').update(String(value)).digest('hex'); }
export function originCheck(req) {
  const origin = req.headers.origin;
  const expected = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : null;
  const local = process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):3122$/.test(origin || '');
  if (!origin || (!local && origin !== expected)) throw new HttpError(403, 'Request origin is not allowed.');
}
export function body(req) {
  if (Number(req.headers['content-length'] || 0) > 24000) throw new HttpError(413, 'Request too large.');
  let value;
  try { value = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { throw new HttpError(400, 'Invalid request.'); }
  if (!value || JSON.stringify(value).length > 24000) throw new HttpError(400, 'Invalid request.');
  return value;
}
export async function throttle(db, key, limit = 40) {
  const minute = Math.floor(Date.now() / 60000);
  const ref = db.collection('_growth_limits').doc(hash(`${key}:${minute}`));
  await db.runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    const count = snapshot.data()?.count || 0;
    if (count >= limit) throw new HttpError(429, 'Please wait a minute before trying again.');
    tx.set(ref, { count: count + 1, expiresAt: Timestamp.fromMillis(Date.now() + 86400000) });
  });
}
export function respondError(res, error) {
  return res.status(error.status || 500).json({ error: error.status ? error.message : 'The service could not complete this request. Please try again.' });
}
export const timestamp = Timestamp;
export function milliseconds(value) { return value?.toMillis?.() || (typeof value === 'number' ? value : 0); }
