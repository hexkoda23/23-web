import { database } from '../server/growth-store.js';
import { optOutRef, validUnsubscribe } from '../server/email-store.js';
import { escapeHtml } from '../server/weekly-letter.js';

const page = (title, line, form = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Twenty3</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f5f1;color:#171717;font-family:Georgia,serif;text-align:center;padding:24px;box-sizing:border-box"><main style="max-width:420px"><p style="letter-spacing:.3em;font-size:14px;margin:0 0 28px">TWENTY3</p><h1 style="font-weight:400;font-size:38px;margin:0 0 14px">${title}</h1><p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#615e57;margin:0 0 26px">${line}</p>${form}</main></body></html>`;

// A GET only asks, because email security scanners open links. Only a POST unsubscribes.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const email = String(req.query?.e || '').toLowerCase();
  const token = String(req.query?.t || '');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).end('Method not allowed.');
  if (!validUnsubscribe(email, token)) return res.status(400).end(page('Link not valid', 'This unsubscribe link is incomplete. Please use the link in your latest email.'));
  if (req.method === 'GET') {
    const action = `/api/unsubscribe?e=${encodeURIComponent(email)}&t=${escapeHtml(token)}`;
    return res.status(200).end(page('Leave the letter?', `We will stop sending the Twenty3 letter to ${escapeHtml(email)}.`, `<form method="post" action="${action}"><button style="background:#171717;color:#fff;border:0;padding:15px 28px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer">Unsubscribe</button></form>`));
  }
  try {
    await optOutRef(database(), email).set({ at: Date.now() });
    return res.status(200).end(page('You are unsubscribed', 'You will not get the Twenty3 letter again. Your account is unchanged.'));
  } catch {
    return res.status(500).end(page('Please try again', 'We could not save that just now. Please try the link again in a moment.'));
  }
}
