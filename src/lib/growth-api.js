import { auth } from './firebase';
export async function growthRequest(action, input = {}) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Sign in with the owner account first.');
  const response = await fetch(action === 'overview' ? `/api/growth?days=${input.days || 30}` : '/api/growth', {
    method: action === 'overview' ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(action === 'overview' ? {} : { body: JSON.stringify({ action, ...input }) }),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('The admin service is unavailable. Restart the local preview or finish the server setup.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not complete the request.');
  return data;
}
export function campaignLink(origin, destination, source, name) {
  const url = new URL(destination, origin);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', source === 'creator' ? 'partnership' : 'social');
  url.searchParams.set('utm_campaign', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 70));
  return url.href;
}
