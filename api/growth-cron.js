import { isCron, respondError } from '../server/growth-store.js';
import { runResearch, pruneAnalytics } from '../server/growth-research.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required.' });
  if (!isCron(req)) return res.status(401).json({ error: 'Unauthorized.' });
  try { const removed = await pruneAnalytics(); return res.status(200).json({ removed, ...await runResearch({ scheduled: true }) }); }
  catch (error) { if (error.status === 409) return res.status(200).json({ skipped: true }); return respondError(res, error); }
}
