// The weekly letter. Runs every Monday 10:00 UTC via the Vercel cron in vercel.json.
// Sends only after the owner turns it on in the Growth Room; see GROWTH_SETUP.md.
import { getAuth } from 'firebase-admin/auth';
import { database, isCron, respondError, HttpError } from '../server/growth-store.js';
import { emailConfigured, runWeeklyLetter } from '../server/email-store.js';
import { PRODUCTS } from '../src/data/products.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!isCron(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    if (!emailConfigured()) throw new HttpError(503, 'Email is not configured.');
    const db = database();
    return res.status(200).json(await runWeeklyLetter(db, getAuth(), PRODUCTS));
  } catch (error) { return respondError(res, error); }
}
