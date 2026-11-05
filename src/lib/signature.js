import * as QRCode from 'qrcode';
import { signatureRef } from '../../server/profile-model';

// The saved link is what the printed code already points to, so it is used first.
export const signatureLink = profile => profile.url || profile.profileUrl || `${window.location.origin}/profile/${profile.id}`;
export const signatureImage = (profile, width = 320) => QRCode.toDataURL(signatureLink(profile), { width, margin: 1 });

function fitted(ctx, text, weight, size, family, width) {
  let next = size;
  do { ctx.font = `${weight} ${next}px ${family}`; next -= 2; } while (ctx.measureText(text).width > width && next > 18);
}
// A print-ready card: the code with the wearer's name and reference underneath.
export async function downloadSignature(profile) {
  const code = document.createElement('canvas');
  await QRCode.toCanvas(code, signatureLink(profile), { width: 900, margin: 1 });
  const card = document.createElement('canvas');
  card.width = 1100;
  card.height = 1420;
  const ctx = card.getContext('2d');
  const ref = signatureRef(profile.id);
  const name = profile.name || 'Twenty3 wearer';
  const detail = [profile.craft, profile.city].filter(Boolean).join(' · ');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, card.width, card.height);
  ctx.fillStyle = '#171717';
  ctx.textAlign = 'center';
  fitted(ctx, 'TWENTY3', 400, 76, 'Georgia, serif', 900);
  ctx.fillText('TWENTY3', 550, 120);
  ctx.drawImage(code, 100, 170);
  fitted(ctx, name, 600, 64, 'Arial, sans-serif', 960);
  ctx.fillText(name, 550, 1160);
  ctx.fillStyle = '#5f5f5f';
  if (detail) { fitted(ctx, detail, 400, 36, 'Arial, sans-serif', 960); ctx.fillText(detail, 550, 1225); }
  ctx.font = '400 32px Arial, sans-serif';
  ctx.fillText(ref, 550, 1300);
  ctx.fillText('Digital signature', 550, 1350);
  const blob = await new Promise(done => card.toBlob(done, 'image/png'));
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `twenty3-signature-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'wearer'}-${ref.toLowerCase()}.png`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);
}
