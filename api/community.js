import { database, originCheck, body, throttle, hash, respondError, HttpError } from '../server/growth-store.js';
import { featuredPeople, saveApplication } from '../server/community-store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    try { return res.status(200).json({ people: await featuredPeople(database()) }); } catch { return res.status(200).json({ people: [] }); }
  }
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'GET or POST required.' });
  try {
    originCheck(req);
    const input = body(req);
    const db = database();
    const salt = process.env.CRON_SECRET;
    if (!salt) throw new HttpError(503, 'Applications are not open yet.');
    const address = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    await throttle(db, hash(`${salt}:apply:${address}`), 5);
    await saveApplication(db, input);
    return res.status(200).json({ received: true });
  } catch (error) { return respondError(res, error); }
}
