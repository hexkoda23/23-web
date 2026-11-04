import { HttpError } from './growth-store.js';

const text = (value, limit) => String(value ?? '').trim().slice(0, limit);
const featuredRef = db => db.collection('_growth_settings').doc('community');

export function cleanApplication(input) {
  const application = { name: text(input.name, 80), email: text(input.email, 120).toLowerCase(), craft: text(input.craft, 60), city: text(input.city, 60), instagram: text(input.instagram, 60), link: text(input.link, 200), why: text(input.why, 600) };
  if (!application.name || !application.craft || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email)) throw new HttpError(400, 'Add your name, a valid email and your craft.');
  return application;
}
export async function saveApplication(db, input) {
  await db.collection('_growth_applications').doc().set({ ...cleanApplication(input), status: 'new', at: Date.now() });
}
// Only the fields a homepage tile needs, and only after the owner has approved the person.
export function publicPerson(id, profile) {
  const file = (profile.craftFiles || []).find(item => /^https:\/\//.test(item.url || '') && (!item.type || item.type.startsWith('image/')));
  return file ? { id, name: text(profile.name, 80), craft: text(profile.craft, 60), city: text(profile.city, 60), image: file.url } : null;
}
export async function featuredPeople(db) {
  const ids = (await featuredRef(db).get()).data()?.ids || [];
  if (!ids.length) return [];
  const profiles = await db.getAll(...ids.map(id => db.collection('digitalProfiles').doc(id)));
  return profiles.filter(doc => doc.exists).map(doc => publicPerson(doc.id, doc.data())).filter(Boolean);
}
export async function setFeatured(db, id, approved) {
  const ref = featuredRef(db);
  await db.runTransaction(async tx => {
    const ids = (await tx.get(ref)).data()?.ids || [];
    const next = approved ? [...new Set([...ids, id])].slice(-8) : ids.filter(value => value !== id);
    tx.set(ref, { ids: next, updatedAt: Date.now() });
  });
}
export async function creativesOverview(db) {
  const [applications, requests, featured] = await Promise.all([db.collection('_growth_applications').orderBy('at', 'desc').limit(100).get(), db.collection('digitalProfiles').where('wantsFeature', '==', true).limit(50).get(), featuredRef(db).get()]);
  return { applications: applications.docs.map(doc => ({ id: doc.id, ...doc.data() })), featured: featured.data()?.ids || [],
    requests: requests.docs.map(doc => { const p = doc.data(); return { id: doc.id, name: text(p.name, 80), craft: text(p.craft, 60), city: text(p.city, 60), hasImage: !!publicPerson(doc.id, p) }; }) };
}
