// TWENTY3 weekly subscriber digest.
//
// Runs every Monday 10:00 UTC via the Vercel cron in vercel.json. Reads every
// signed-up email from the Firestore `subscribers` collection (written on
// signup) and sends a branded weekly reminder through Resend.
//
// Required environment variables (set in Vercel → Project → Settings → Env):
//   FIREBASE_SERVICE_ACCOUNT  JSON of a Firebase service-account key
//                             (Firebase console → Project settings →
//                              Service accounts → Generate new private key)
//   RESEND_API_KEY            API key from https://resend.com
// Optional:
//   EMAIL_FROM    Verified sender, e.g. "TWENTY3 <hello@yourdomain.com>"
//                 (defaults to Resend's onboarding sender for testing)
//   SITE_URL      Public site URL used in email links
//   CRON_SECRET   If set, requests must carry "Authorization: Bearer <secret>"
//                 (Vercel cron sends this automatically once defined)
//
// Manual test: GET /api/weekly-email?key=<CRON_SECRET>
import admin from 'firebase-admin';
import { PRODUCTS } from '../src/data/products.js';

const SITE_URL = process.env.SITE_URL || 'https://23-web.vercel.app';
const FROM = process.env.EMAIL_FROM || 'TWENTY3 <onboarding@resend.dev>';

function getDb() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  return admin.firestore();
}

function pickFeatured(count = 3) {
  const pool = PRODUCTS.filter(product => !product.hidden && product.inStock);
  // Rotate the selection by ISO week so each weekly email features new pieces.
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const picks = [];
  for (let i = 0; i < count && pool.length; i += 1) {
    picks.push(pool[(week * count + i * 7) % pool.length]);
  }
  return [...new Map(picks.map(product => [product.id, product])).values()];
}

const formatPrice = (value) => `₦${Number(value || 0).toLocaleString('en-NG')}`;

function buildEmailHtml(featured) {
  const cards = featured.map(product => `
    <tr>
      <td style="padding:14px 0;border-top:1px solid #26241f;">
        <a href="${SITE_URL}/product/${product.id}" style="color:#F4F0E8;text-decoration:none;font-size:18px;font-family:Georgia,serif;">
          ${product.name}
        </a>
        <div style="color:#8a857c;font-size:12px;padding-top:4px;letter-spacing:1px;">${formatPrice(product.price)}</div>
        <a href="${SITE_URL}/product/${product.id}" style="display:inline-block;margin-top:8px;color:#F1ECE1;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:underline;">Shop the piece</a>
      </td>
    </tr>`).join('');

  return `
  <div style="background:#0a0a0a;padding:40px 20px;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;color:#F4F0E8;">
      <tr><td style="font-family:Arial Black,Arial,sans-serif;font-weight:900;font-size:26px;letter-spacing:-0.5px;color:#ffffff;">TWENTY3<span style="font-size:10px;vertical-align:top;">TM</span></td></tr>
      <tr><td style="padding-top:18px;font-size:22px;font-style:italic;">Your weekly edit is here.</td></tr>
      <tr><td style="padding:12px 0 22px;color:#b5b0a6;font-size:14px;line-height:1.7;">
        A quiet reminder from Lagos: the wardrobe you keep imagining is in stock.
        Three pieces we think belong on you this week —
      </td></tr>
      ${cards}
      <tr><td style="padding-top:26px;">
        <a href="${SITE_URL}/shop" style="display:inline-block;background:#F1ECE1;color:#050505;padding:14px 32px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;font-weight:bold;">Shop the Collection</a>
      </td></tr>
      <tr><td style="padding-top:16px;">
        <a href="${SITE_URL}/ai-studio" style="color:#8a857c;font-size:12px;text-decoration:underline;">Let the AI stylist build your fit &rarr;</a>
      </td></tr>
      <tr><td style="padding-top:34px;border-top:1px solid #26241f;margin-top:24px;color:#6b675f;font-size:11px;line-height:1.8;">
        TWENTY3&trade; &middot; Lagos, Nigeria &middot; Wear Your World<br/>
        Questions? WhatsApp us: <a href="https://wa.me/2348107869063" style="color:#8a857c;">wa.me/2348107869063</a><br/>
        You are receiving this because you created a TWENTY3 account.
        Reply with UNSUBSCRIBE to stop these emails.
      </td></tr>
    </table>
  </div>`;
}

async function sendBatch(recipients, subject, html) {
  // Resend batch endpoint accepts up to 100 emails per call.
  const chunks = [];
  for (let i = 0; i < recipients.length; i += 100) {
    chunks.push(recipients.slice(i, i + 100));
  }

  let sent = 0;
  const failures = [];
  for (const chunk of chunks) {
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(chunk.map(email => ({ from: FROM, to: [email], subject, html }))),
    });
    if (response.ok) {
      sent += chunk.length;
    } else {
      failures.push(await response.text());
    }
  }
  return { sent, failures };
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = req.headers.authorization || '';
    const key = req.query?.key;
    if (header !== `Bearer ${secret}` && key !== secret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.RESEND_API_KEY) {
    return res.status(500).json({
      error: 'Email digest not configured. Set FIREBASE_SERVICE_ACCOUNT and RESEND_API_KEY in Vercel environment variables.',
    });
  }

  try {
    const db = getDb();
    const snapshot = await db.collection('subscribers').get();
    const emails = [...new Set(
      snapshot.docs
        .map(docSnap => ({ email: docSnap.data().email, unsubscribed: docSnap.data().unsubscribed }))
        .filter(entry => entry.email && !entry.unsubscribed && /\S+@\S+\.\S+/.test(entry.email))
        .map(entry => entry.email.toLowerCase())
    )];

    if (!emails.length) {
      return res.status(200).json({ sent: 0, message: 'No subscribers yet.' });
    }

    const featured = pickFeatured(3);
    const html = buildEmailHtml(featured);
    const subject = 'Your weekly TWENTY3 edit — new fits are waiting';
    const { sent, failures } = await sendBatch(emails, subject, html);

    return res.status(200).json({ subscribers: emails.length, sent, failures });
  } catch (error) {
    console.error('weekly-email failed:', error);
    return res.status(500).json({ error: String(error.message || error) });
  }
}
