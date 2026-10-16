import { DEFAULT_SETTINGS, researchQuery, safeUrl } from './growth-model.js';
import { database, hash, HttpError, timestamp } from './growth-store.js';

export async function runResearch({ scheduled = false, fetcher = fetch, store } = {}) {
  const db = store || database();
  const settingsDoc = await db.collection('_growth_settings').doc('workspace').get();
  const settings = { ...DEFAULT_SETTINGS, ...settingsDoc.data() };
  if (scheduled && !settings.enabled) return { skipped: true, reason: 'Daily research is paused.' };
  if (!process.env.SERPAPI_API_KEY) throw new HttpError(503, 'Add SERPAPI_API_KEY on the server to run research.');
  const day = new Date().toISOString().slice(0, 10);
  const dailyLimit = Math.min(5, Math.max(1, Number(process.env.RESEARCH_DAILY_LIMIT) || 2));
  const usageRef = db.collection('_growth_research_usage').doc(day);
  // Reserve before calling the paid API. Both manual and scheduled runs share the cap.
  await db.runTransaction(async tx => {
    const snapshot = await tx.get(usageRef);
    const usage = snapshot.data() || { count: 0 };
    if (scheduled && usage.scheduled) throw new HttpError(409, 'Today’s scheduled research already ran.');
    if (usage.count >= dailyLimit) throw new HttpError(429, `Daily research limit reached (${dailyLimit} searches).`);
    tx.set(usageRef, { count: usage.count + 1, scheduled: scheduled || !!usage.scheduled, expiresAt: timestamp.fromMillis(Date.now() + 90 * 86400000) });
  });
  const query = researchQuery(settings);
  const runRef = db.collection('_growth_runs').doc();
  await runRef.set({ at: Date.now(), query, status: 'running', scheduled });
  try {
    const params = new URLSearchParams({ engine: 'google', q: query, gl: 'ng', hl: 'en', api_key: process.env.SERPAPI_API_KEY });
    const response = await fetcher(`https://serpapi.com/search.json?${params}`, { signal: AbortSignal.timeout(18000) });
    if (!response.ok) throw new Error('Search provider rejected the request.');
    const data = await response.json();
    if (data.error) throw new Error('Search provider could not complete the query.');
    const results = (data.organic_results || []).slice(0, 10).map(r => ({
      url: safeUrl(r.link), title: String(r.title || '').slice(0, 180), snippet: String(r.snippet || '').slice(0, 500),
    })).filter(r => r.url && r.title);
    let added = 0;
    for (const result of results) {
      const url = new URL(result.url); url.hash = ''; url.search = '';
      const ref = db.collection('_growth_opportunities').doc(hash(url.href));
      const created = await db.runTransaction(async tx => {
        const existing = await tx.get(ref);
        if (existing.exists) { tx.update(ref, { lastSeenAt: Date.now() }); return false; }
        tx.create(ref, { ...result, focus: settings.focus, query, status: 'new', notes: '', createdAt: Date.now(), lastSeenAt: Date.now() });
        return true;
      });
      if (created) added += 1;
    }
    await runRef.update({ status: 'complete', results: results.length, added, finishedAt: Date.now() });
    return { results: results.length, added, query };
  } catch {
    await runRef.update({ status: 'failed', finishedAt: Date.now(), error: 'Check the SerpAPI key, credits, and provider status. This attempt counted toward the daily cap.' });
    throw new HttpError(502, 'Research failed. Check your SerpAPI key and credits. This attempt counted toward the daily cap.');
  }
}

export async function pruneAnalytics() {
  const db = database();
  let deleted = 0;
  for (const name of ['_growth_events', '_growth_limits', '_growth_research_usage']) {
    // Bounded cleanup, with Firestore TTL recommended as the primary expiry mechanism.
    const stale = await db.collection(name).where('expiresAt', '<=', timestamp.now()).limit(400).get();
    if (stale.empty) continue;
    const batch = db.batch(); stale.docs.forEach(doc => batch.delete(doc.ref)); await batch.commit(); deleted += stale.size;
  }
  return deleted;
}
