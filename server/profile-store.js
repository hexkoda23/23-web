import { HttpError, milliseconds } from './growth-store.js';
import { privateFields, recordScan, scanSummary, signatureRef } from './profile-model.js';

export async function saveScan(db, id, now = Date.now()) {
  if (!(await db.collection('digitalProfiles').doc(id).get()).exists) throw new HttpError(404, 'Profile not found.');
  const ref = db.collection('_growth_profile_scans').doc(id);
  await db.runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    tx.set(ref, recordScan(snapshot.data(), now));
  });
}
// One row per digital signature, for the owner's dashboard. The code itself is drawn in the browser.
export function signatureRow(id, profile, stats, now = Date.now()) {
  const site = (process.env.SITE_URL || 'https://www.shopfrom23.com').replace(/\/$/, '');
  return { id, ref: signatureRef(id), name: String(profile.name || ''), craft: String(profile.craft || ''), city: String(profile.city || ''), owner: String(profile.userId || ''), url: String(profile.profileUrl || `${site}/profile/${id}`), createdAt: milliseconds(profile.createdAt), scans: scanSummary(stats, now) };
}
export async function signaturesOverview(db, now = Date.now()) {
  const [profiles, scans] = await Promise.all([db.collection('digitalProfiles').select('name', 'craft', 'city', 'userId', 'profileUrl', 'createdAt').limit(1001).get(), db.collection('_growth_profile_scans').get()]);
  const stats = new Map(scans.docs.map(doc => [doc.id, doc.data()]));
  const rows = profiles.docs.slice(0, 1000).map(doc => signatureRow(doc.id, doc.data(), stats.get(doc.id), now));
  return { rows: rows.sort((a, b) => b.createdAt - a.createdAt), truncated: profiles.size > 1000 };
}
// Copies private details to a server-only collection first, so nothing is lost when they leave the public record.
export async function protectProfiles(db, removeField) {
  const profiles = await db.collection('digitalProfiles').get();
  const exposed = profiles.docs.map(doc => ({ doc, moved: privateFields(doc.data()) })).filter(row => Object.keys(row.moved).length);
  for (let start = 0; start < exposed.length; start += 200) {
    const batch = db.batch();
    exposed.slice(start, start + 200).forEach(({ doc, moved }) => {
      batch.set(db.collection('_growth_profile_private').doc(doc.id), { ...moved, movedAt: Date.now() }, { merge: true });
      batch.update(doc.ref, Object.fromEntries(Object.keys(moved).map(field => [field, removeField()])));
    });
    await batch.commit();
  }
  return exposed.length;
}
