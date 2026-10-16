import { getAuth } from 'firebase-admin/auth';
import { requireAdmin, database, body, HttpError, respondError, milliseconds, throttle, timestamp } from '../server/growth-store.js';
import { DEFAULT_SETTINGS, FOCUSES, summarize } from '../server/growth-model.js';
import { runResearch } from '../server/growth-research.js';

const docId = value => { if (!/^[a-zA-Z0-9_-]{1,128}$/.test(value || '')) throw new HttpError(400, 'Invalid record.'); return value; };
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'GET or POST required.' });
  try {
    const owner = await requireAdmin(req);
    const db = database();
    if (req.method === 'GET') {
      const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
      const since = Date.now() - days * 86400000;
      const [events, orders, settings, opportunities, runs, campaigns, accounts] = await Promise.all([
        db.collection('_growth_events').where('at', '>=', since).orderBy('at', 'desc').limit(5001).get(),
        db.collection('orders').where('createdAt', '>=', timestamp.fromMillis(since)).orderBy('createdAt', 'desc').limit(301).get(),
        db.collection('_growth_settings').doc('workspace').get(),
        db.collection('_growth_opportunities').orderBy('createdAt', 'desc').limit(100).get(),
        db.collection('_growth_runs').orderBy('at', 'desc').limit(10).get(),
        db.collection('_growth_campaigns').orderBy('updatedAt', 'desc').limit(40).get(),
        getAuth().listUsers(1000),
      ]);
      const eventRows = events.docs.slice(0, 5000).map(d => d.data());
      const orderRows = orders.docs.slice(0, 300).map(d => {
        const o = d.data();
        return { id: d.id, email: String(o.email || '').slice(0, 200), total: Number(o.total) || 0,
          createdAt: milliseconds(o.createdAt), status: String(o.status || 'awaiting_payment'),
          items: (Array.isArray(o.items) ? o.items : []).slice(0, 30).map(i => ({ name: String(i.name || ''), quantity: Number(i.quantity) || 0, size: String(i.size || '') })) };
      });
      const reviews = orderRows.length ? await db.getAll(...orderRows.map(o => db.collection('_growth_order_reviews').doc(o.id))) : [];
      return res.status(200).json({
        ...summarize(eventRows, orderRows, reviews.filter(d => d.exists).map(d => ({ id: d.id, ...d.data() }))),
        ownerUid: owner.uid, days, siteUrl: process.env.SITE_URL || '', sampled: events.size > 5000 || orders.size > 300, accountListTruncated: !!accounts.pageToken,
        settings: { ...DEFAULT_SETTINGS, ...settings.data() },
        configured: { search: !!process.env.SERPAPI_API_KEY, analytics: !!process.env.CRON_SECRET && !!process.env.SITE_URL, cron: !!process.env.CRON_SECRET },
        dailyLimit: Math.min(5, Math.max(1, Number(process.env.RESEARCH_DAILY_LIMIT) || 2)),
        opportunities: opportunities.docs.map(d => ({ id: d.id, ...d.data() })),
        runs: runs.docs.map(d => ({ id: d.id, ...d.data() })), campaigns: campaigns.docs.map(d => ({ id: d.id, ...d.data() })),
        accounts: accounts.users.map(u => ({ id: u.uid, email: u.email || '', verified: u.emailVerified, createdAt: u.metadata.creationTime, lastSignIn: u.metadata.lastSignInTime, providers: u.providerData.map(p => p.providerId) })).sort((a, b) => new Date(b.lastSignIn || 0) - new Date(a.lastSignIn || 0)),
      });
    }
    const input = body(req);
    await throttle(db, `admin:${owner.uid}`, 30);
    if (input.action === 'settings') {
      if (!FOCUSES.includes(input.focus) || typeof input.enabled !== 'boolean' || !Number.isFinite(Number(input.monthlyBudget)) || Number(input.monthlyBudget) < 0 || Number(input.monthlyBudget) > 10000000) throw new HttpError(400, 'Choose a valid focus and monthly budget.');
      if (input.enabled && (!process.env.SERPAPI_API_KEY || !process.env.CRON_SECRET)) throw new HttpError(400, 'Connect SerpAPI and configure the schedule secret before enabling research.');
      await db.collection('_growth_settings').doc('workspace').set({ ...DEFAULT_SETTINGS, focus: input.focus, monthlyBudget: Number(input.monthlyBudget), enabled: input.enabled, updatedAt: Date.now(), updatedBy: owner.uid });
    } else if (input.action === 'research') {
      return res.status(200).json(await runResearch());
    } else if (input.action === 'opportunity') {
      if (!['new', 'shortlisted', 'contacted', 'partnered', 'dismissed'].includes(input.status)) throw new HttpError(400, 'Invalid opportunity status.');
      await db.collection('_growth_opportunities').doc(docId(input.id)).update({ status: input.status, notes: String(input.notes || '').slice(0, 1000), updatedAt: Date.now() });
    } else if (input.action === 'campaign') {
      const title = String(input.title || '').trim().slice(0, 120);
      const copy = String(input.copy || '').trim().slice(0, 5000);
      if (!title || !copy || !['draft', 'ready', 'published'].includes(input.status)) throw new HttpError(400, 'Add a title, copy, and valid status.');
      const destination = String(input.destination || '/shop');
      if (!/^\/(shop|product\/[a-zA-Z0-9_-]+)$/.test(destination)) throw new HttpError(400, 'Choose a shop or product destination.');
      const ref = input.id ? db.collection('_growth_campaigns').doc(docId(input.id)) : db.collection('_growth_campaigns').doc();
      await ref.set({ title, copy, destination, status: input.status, source: ['instagram', 'tiktok', 'whatsapp', 'creator'].includes(input.source) ? input.source : 'instagram', updatedAt: Date.now(), updatedBy: owner.uid }, { merge: true });
    } else if (input.action === 'review_order') {
      if (!['paid', 'awaiting_payment', 'cancelled', 'refunded'].includes(input.status)) throw new HttpError(400, 'Invalid order status.');
      const amount = Number(input.amount);
      const reference = String(input.reference || '').trim().slice(0, 150);
      if (input.status === 'paid' && (!Number.isFinite(amount) || amount <= 0 || amount > 10000000 || !reference)) throw new HttpError(400, 'Enter the amount received and a bank or receipt reference.');
      const id = docId(input.id);
      if (!(await db.collection('orders').doc(id).get()).exists) throw new HttpError(404, 'Order not found.');
      const review = { status: input.status, amount: input.status === 'paid' ? amount : 0, reference, updatedAt: Date.now(), updatedBy: owner.uid };
      const batch = db.batch();
      batch.set(db.collection('_growth_order_reviews').doc(id), review);
      batch.set(db.collection('_growth_order_audit').doc(), { ...review, orderId: id });
      await batch.commit();
    } else throw new HttpError(400, 'Unknown action.');
    return res.status(200).json({ ok: true });
  } catch (error) { return respondError(res, error); }
}
