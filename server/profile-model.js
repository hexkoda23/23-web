// Everything saved on a digitalProfiles document is publicly readable, so private details stay out of it.
export const CRAFTS = ['Photographer', 'Videographer', 'Stylist', 'Designer', 'Illustrator', 'Painter', 'Musician', 'DJ', 'Producer', 'Writer', 'Model', 'Makeup artist', 'Creative director', 'Content creator'];
export const SAMPLE_PROFILE = {
  id: 'twenty3', isSample: true, name: 'Twenty3', craft: 'Fashion house', city: 'Lagos', openForWork: true,
  bio: 'This is what people see when they scan your outfit: who you are, what you make, and how to hire you.',
  igHandle: 'twentythreepreppy', workContact: 'https://www.shopfrom23.com/contact',
  craftFiles: ['6.jpg', 'JF-11.JPG', '13.jpg', 'JF-8.JPG'].map(file => ({ name: file, type: 'image/jpeg', url: `/lookbook/${file}` })),
};
const DAY = 86400000;
const text = (value, limit) => String(value ?? '').trim().slice(0, limit);
const dayKey = time => new Date(time).toISOString().slice(0, 10);

export function profileFields(form) {
  const showPhone = form.showPhone === true;
  return {
    name: text(form.name, 80), craft: text(form.craft, 60), city: text(form.city, 60), bio: text(form.bio, 200),
    openForWork: form.openForWork !== false, wantsFeature: form.wantsFeature === true, workContact: text(form.workContact, 200),
    igHandle: text(form.igHandle, 60), xHandle: text(form.xHandle, 60), snapchat: text(form.snapchat, 60), tiktok: text(form.tiktok, 60), website: text(form.website, 200),
    showPhone, phone: showPhone ? text(form.phone, 30) : '',
    craftFiles: (form.craftFiles || []).filter(file => file.status !== 'uploading'),
  };
}
function webLink(value) {
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value);
  if (hasScheme && !/^https?:\/\//i.test(value)) return null;
  if (!hasScheme && !/^[^\s/]+\.[^\s/]{2,}/.test(value)) return null;
  try { return new URL(hasScheme ? value : `https://${value}`).href; } catch { return null; }
}
export function workLink(profile) {
  const contact = text(profile?.workContact, 200);
  if (/^[^\s@:/]+@[^\s@:/]+\.[^\s@:/]+$/.test(contact)) return `mailto:${contact}`;
  const digits = contact.replace(/[\s()+-]/g, '');
  if (/^\d{7,15}$/.test(digits)) return `https://wa.me/${digits.replace(/^0/, '234')}`;
  const link = contact && webLink(contact);
  if (link) return link;
  const handle = text(profile?.igHandle, 60).replace(/[^a-zA-Z0-9._]/g, '');
  if (handle) return `https://ig.me/m/${handle}`;
  return profile?.website ? webLink(text(profile.website, 200)) : null;
}
export function privateFields(profile) {
  const moved = {};
  if (profile.userEmail) moved.userEmail = profile.userEmail;
  if (profile.phone && profile.showPhone !== true) moved.phone = profile.phone;
  return moved;
}
export function recordScan(stats = {}, now = Date.now()) {
  const oldest = dayKey(now - 35 * DAY);
  const days = Object.fromEntries(Object.entries(stats.days || {}).filter(([day]) => day >= oldest));
  const today = dayKey(now);
  days[today] = (days[today] || 0) + 1;
  return { total: (stats.total || 0) + 1, days, updatedAt: now };
}
export function scanSummary(stats = {}, now = Date.now()) {
  const oldest = dayKey(now - 6 * DAY);
  const week = Object.entries(stats.days || {}).reduce((sum, [day, count]) => day >= oldest ? sum + count : sum, 0);
  return { total: stats.total || 0, week };
}
