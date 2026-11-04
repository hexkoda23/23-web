import { HttpError } from './growth-store.js';
import { privateFields, recordScan } from './profile-model.js';

export async function saveScan(db, id, now = Date.now()) {
  if (!(await db.collection('digitalProfiles').doc(id).get()).exists) throw new HttpError(404, 'Profile not found.');
  const ref = db.collection('_growth_profile_scans').doc(id);
  await db.runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    tx.set(ref, recordScan(snapshot.data(), now));
  });
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
