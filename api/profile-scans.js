import { database, originCheck, body, throttle, hash, verifyUser, respondError, HttpError } from '../server/growth-store.js';
import { scanSummary } from '../server/profile-model.js';
import { saveScan } from '../server/profile-store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'GET or POST required.' });
  try {
    if (req.method === 'GET') {
      const user = await verifyUser(req);
      const db = database();
      const profiles = await db.collection('digitalProfiles').where('userId', '==', user.uid).limit(20).get();
      const stats = profiles.empty ? [] : await db.getAll(...profiles.docs.map(doc => db.collection('_growth_profile_scans').doc(doc.id)));
      return res.status(200).json({ scans: Object.fromEntries(stats.map(doc => [doc.id, scanSummary(doc.data())])) });
    }
    originCheck(req);
    const { id } = body(req);
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id || '')) throw new HttpError(400, 'Invalid profile.');
    const db = database();
    // Scans are anonymous totals: only a salted hash is kept, briefly, to limit repeat counting.
    const salt = process.env.CRON_SECRET;
    if (!salt) throw new HttpError(503, 'Scan counting is not configured yet.');
    const address = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    await throttle(db, hash(`${salt}:${address}:${id}`), 3);
    await saveScan(db, id);
    return res.status(200).json({ counted: true });
  } catch (error) { return respondError(res, error); }
}
