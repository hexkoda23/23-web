import { database, originCheck, body, throttle, hash, verifyUser, timestamp, respondError, HttpError } from '../server/growth-store.js';
import { sanitizeEvent } from '../server/growth-model.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });
  try {
    originCheck(req);
    const input = body(req);
    if (input.consent !== true || !/^[a-f0-9-]{36}$/.test(input.sessionId || '') || !Array.isArray(input.events) || input.events.length > 20) throw new HttpError(400, 'Invalid analytics batch.');
    const db = database();
    // Only a salted hash is retained for short-lived abuse prevention; no raw IP is saved.
    const salt = process.env.CRON_SECRET;
    if (!salt) throw new HttpError(503, 'Analytics is not configured yet.');
    const address = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    await throttle(db, hash(`${salt}:${address}`), 40);
    let authenticated = false;
    if (req.headers.authorization) { await verifyUser(req); authenticated = true; }
    const events = input.events.map(sanitizeEvent).filter(Boolean).filter(e => !['login', 'signup'].includes(e.type) || authenticated);
    const unique = [...new Map(events.map(e => [e.id, e])).values()];
    const refs = unique.map(e => db.collection('_growth_events').doc(hash(`${input.sessionId}:${e.id}`)));
    if (!refs.length) return res.status(200).json({ accepted: 0 });
    const existing = await db.getAll(...refs);
    const batch = db.batch();
    let accepted = 0;
    unique.forEach((event, index) => {
      if (existing[index].exists) return;
      batch.create(refs[index], { ...event, sessionId: input.sessionId, authenticated, at: Date.now() - unique.length + index, expiresAt: timestamp.fromMillis(Date.now() + 90 * 86400000) });
      accepted += 1;
    });
    try { await batch.commit(); } catch (error) { if (error.code !== 6) throw error; }
    return res.status(200).json({ accepted });
  } catch (error) { return respondError(res, error); }
}
