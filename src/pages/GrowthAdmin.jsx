import { createElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { Activity, ArrowUpRight, BarChart3, Compass, Copy, LayoutDashboard, Megaphone, RefreshCw, Settings, ShoppingBag, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { growthRequest, campaignLink } from '../lib/growth-api';
import { growthDemo } from '../data/growthDemo';
import { PRODUCTS } from '../data/products';
import { FOCUSES } from '../../server/growth-model';
import '../growth.css';

const money = n => `₦${Number(n || 0).toLocaleString('en-NG')}`;
const date = n => n ? new Date(n).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not available';
const names = { page_view: 'Page visit', product_view: 'Product view', add_to_cart: 'Added to bag', remove_from_cart: 'Removed from bag', checkout_start: 'Checkout opened', order_created: 'Order created', login: 'Signed in', signup: 'Account created', logout: 'Signed out', scroll_depth: 'Scroll depth', page_engagement: 'Active reading time', navigation: 'Link clicked', whatsapp_click: 'WhatsApp opened' };
const tabs = [['overview', 'Overview', LayoutDashboard], ['journeys', 'Visitor journeys', Activity], ['orders', 'Orders & payments', ShoppingBag], ['people', 'Accounts', Users], ['radar', 'Opportunity radar', Compass], ['studio', 'Campaign studio', Megaphone], ['settings', 'Connections', Settings]];
const weeklyPlan = [
  ['Monday', 'Show the fit', 'Film a 15-second front, side, and back view in daylight. Include your height and the size you wear.'],
  ['Tuesday', 'Make the details clear', 'Show stitching, the barcode experience, the price, and available colors. Answer a real sizing question.'],
  ['Wednesday', 'Find your people', 'Shortlist three relevant Nigerian creators or communities from the radar. Review their audience and recent activity.'],
  ['Thursday', 'Style one piece three ways', 'Use clothes you already own. Make the outfit easy for someone else to recreate.'],
  ['Friday', 'Invite a conversation', 'Post the price and a clear shop link. Offer sizing help; state how delivery is arranged.'],
  ['Saturday', 'Build trust', 'Share a real packing or making process. Ask past customers for permission to feature their photos.'],
  ['Sunday', 'Review and repeat', 'Compare product views, bag additions, pending orders, and confirmed payments. Repeat the strongest content idea.'],
];

function Empty({ children }) { return <div className="growth-empty"><BarChart3 size={24} /><p>{children}</p></div>; }
function Setup() {
  return <div className="growth-setup"><h2>Connect your store once</h2><p>Sign in as <strong>kehindeadeleke92@gmail.com</strong> and verify that email. Add these server environment variables in your hosting project, then redeploy:</p><dl><dt>FIREBASE_SERVICE_ACCOUNT</dt><dd>Firebase Admin credentials for this store.</dd><dt>SERPAPI_API_KEY</dt><dd>Your SerpAPI key. Keep it on the server; do not put it in browser code.</dd><dt>SITE_URL</dt><dd>Your real store address, starting with https://.</dd><dt>CRON_SECRET</dt><dd>A long random secret protecting the daily research job.</dd></dl><p>Daily research starts only after you enable it in Connections. Full setup and database access rules are in <code>GROWTH_SETUP.md</code>.</p></div>;
}

export default function GrowthAdmin() {
  const { currentUser, loading } = useAuth();
  const [demo, setDemo] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('overview');
  const [days, setDays] = useState(30);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!currentUser || demo) return;
    let cancelled = false;
    growthRequest('overview', { days }).then(result => { if (!cancelled) { setData(result); setError(''); } }).catch(err => { if (!cancelled) { setError(err.message); setData(null); } });
    return () => { cancelled = true; };
  }, [currentUser, days, revision, demo]);
  const display = demo ? growthDemo() : (currentUser && data?.ownerUid === currentUser.uid ? data : null);
  const act = async (action, input, success = 'Saved.') => {
    if (demo) { setNotice('Sample preview only. Sign in and connect the store to save changes.'); return false; }
    setBusy(true); setError(''); setNotice('');
    try { const result = await growthRequest(action, input); setNotice(action === 'research' ? `Research complete: ${result.added} new opportunities from ${result.results} results.` : success); setRevision(v => v + 1); return true; }
    catch (err) { setError(err.message); return false; }
    finally { setBusy(false); }
  };
  const verify = async () => {
    try { await sendEmailVerification(currentUser); setNotice('Verification email requested. Check your inbox, verify it, then refresh access.'); } catch { setError('Could not request verification. Please wait and try again.'); }
  };
  const refresh = async () => {
    try {
      if (currentUser) { await currentUser.reload(); await currentUser.getIdToken(true); }
      setRevision(v => v + 1);
    } catch { setError('Could not refresh access. Check your connection and try again.'); }
  };
  if (!display) return <section className="growth-gate"><p className="eyebrow">Twenty3 · Owner workspace</p><h1>Turn attention<br /><em>into a next step.</em></h1><p>Understand your store, find relevant opportunities, and plan the content that moves your brand forward.</p>{loading ? <p>Checking sign-in…</p> : !currentUser ? <Link className="growth-primary" to="/login?redirect=/admin/growth">Sign in to admin</Link> : <div className="growth-actions">{!currentUser.emailVerified && <button onClick={verify}>Verify my email</button>}<button onClick={refresh}>Refresh access</button></div>}{error && <p role="alert" className="growth-error">{error}</p>}{notice && <p role="status">{notice}</p>}<button className="growth-preview-button" onClick={() => setDemo(true)}>Explore a sample dashboard</button><Setup /></section>;
  return <div className="growth-shell">
    <aside className="growth-sidebar"><Link to="/admin/growth" className="growth-wordmark">TWENTY3<span>GROWTH ROOM</span></Link><nav aria-label="Admin sections">{tabs.map(([id, label, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{createElement(Icon, { size: 18 })}{label}</button>)}</nav><div className="growth-sidebar-note"><span className="growth-dot" /> Nigeria nationwide<p>Small experiments.<br />Clearer decisions.</p><Link to="/">Back to the store <ArrowUpRight size={14} /></Link></div></aside>
    <div className="growth-main"><header className="growth-topbar"><span>OWNER WORKSPACE / {tabs.find(t => t[0] === tab)?.[1].toUpperCase()}</span><div><label className="growth-period">Period<select aria-label="Report period" value={days} disabled={demo} onChange={e => setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></label><button aria-label="Refresh dashboard" onClick={refresh} disabled={demo || busy}><RefreshCw size={16} /></button></div></header>
      {demo && <div className="growth-demo" role="status">SAMPLE PREVIEW · These are illustrative events, not your real store results. <button onClick={() => setDemo(false)}>Exit preview</button></div>}
      {error && <p role="alert" className="growth-error">{error}</p>}{notice && <p role="status" className="growth-notice">{notice}</p>}
      {display.sampled && <p className="growth-notice">This report reached its limit of 5,000 events or 300 orders. Shorten the date range; totals describe the loaded sample.</p>}
      {tab === 'overview' && <Overview data={display} choose={setTab} />}
      {tab === 'journeys' && <Journeys data={display} />}
      {tab === 'orders' && <Orders data={display} act={act} busy={busy} />}
      {tab === 'people' && <People data={display} />}
      {tab === 'radar' && <Radar data={display} act={act} busy={busy} />}
      {tab === 'studio' && <Studio data={display} act={act} busy={busy} />}
      {tab === 'settings' && <Connections key={JSON.stringify(display.settings)} data={display} act={act} busy={busy} />}
    </div>
  </div>;
}

function Heading({ label, title, children }) { return <div className="growth-heading"><p>{label}</p><h1>{title}</h1>{children && <div>{children}</div>}</div>; }
function Overview({ data, choose }) {
  const t = data.totals;
  const recommendation = !t.sessions ? 'Start with one product and one trackable shop link. Publish a real fit video, then check whether people reach the product page.' : !data.funnel[2].count ? 'Visitors are reaching the store. Make sizing, fit, price, and delivery expectations easy to find, then test one product-focused post.' : !t.paidOrders ? 'Some interest is reaching the bag. Review pending orders and help customers understand payment and delivery before increasing ad spend.' : 'Build on the products that convert. Compare campaign traffic with paid orders before scaling the next experiment.';
  return <><Heading label="A clearer view of your brand" title="Every visit is a clue."><p>See where attention turns into action — and where the next improvement belongs.</p></Heading><div className="growth-stats">{[['Tracked sessions', t.sessions, 'Visitors who allowed analytics'], ['Product views', data.products.reduce((n, p) => n + p.views, 0), 'Product pages viewed'], ['Orders created', t.orders, 'Orders placed in this period'], ['Confirmed payments', money(t.revenue), `${t.paidOrders} orders marked paid by you`]].map(([label, value, note]) => <article key={label}><p>{label}</p><strong>{value}</strong><span>{note}</span></article>)}</div>
    <div className="growth-grid"><section className="growth-panel"><div className="growth-panel-title"><h2>The shopping journey</h2><span>Ordered sessions</span></div><p className="growth-muted">Each step counts sessions that completed all earlier steps in order. Quick-add paths may skip a product view.</p><div className="growth-funnel">{data.funnel.map((s, i) => <div key={s.type}><span>0{i + 1} · {names[s.type]}</span><strong>{s.count}</strong><div style={{ width: `${data.funnel[0].count ? Math.max(2, s.count / data.funnel[0].count * 100) : 0}%` }} /></div>)}</div><p className="growth-muted">An order ID is not a sale. Payment is confirmed separately.</p></section><section className="growth-next"><p className="eyebrow">Your next useful move</p><h2>Start small.<br /><em>Learn something real.</em></h2><p>{recommendation}</p><button onClick={() => choose('studio')}>Plan this week <ArrowUpRight size={16} /></button></section></div>
    <div className="growth-grid"><section className="growth-panel"><h2>Products getting attention</h2>{!data.products.length ? <Empty>Product views and bag additions will appear after consenting visitors browse.</Empty> : <div className="growth-table-wrap"><table><thead><tr><th>Product</th><th>Views</th><th>Bag adds</th></tr></thead><tbody>{data.products.slice(0, 8).map(p => <tr key={p.id}><td>{PRODUCTS.find(x => x.id === p.id)?.name || p.id}</td><td>{p.views}</td><td>{p.adds}</td></tr>)}</tbody></table></div>}</section><section className="growth-panel"><h2>Where traffic comes from</h2>{!data.sources.length ? <Empty>Add campaign links to posts to see which content brings people here.</Empty> : data.sources.slice(0, 8).map(s => <div className="growth-row" key={s.name}><span>{s.name}</span><strong>{s.sessions} sessions</strong></div>)}<p className="growth-muted">Session attribution uses the entry campaign or referring domain. It does not prove an ad caused a sale.</p></section></div>
  </>;
}
function Journeys({ data }) {
  return <><Heading label="Understand the experience" title="Follow the shopping journey."><p>Public page activity, scroll milestones, and bag actions from consenting visitors. Sessions are anonymous; signed-in state is shown without linking a journey to an email.</p></Heading><section className="growth-panel"><h2>Top pages</h2>{data.pages.length ? data.pages.slice(0, 10).map(p => <div key={p.path} className="growth-row"><span>{p.path}</span><strong>{p.views} views</strong></div>) : <Empty>No tracked page visits yet.</Empty>}</section><section className="growth-panel"><h2>Recent sessions</h2>{!data.journeys.length ? <Empty>Journeys appear after visitors allow analytics. Past browsing cannot be reconstructed.</Empty> : data.journeys.map(s => <details className="growth-session" key={s.id}><summary><span>Session {s.id.slice(0, 8)} · {s.authenticated ? 'Signed-in activity' : 'Guest activity'}</span><span>{s.events.length} events · {date(s.events.at(-1)?.at)}</span></summary><ol>{s.events.map(e => <li key={e.id}><time>{date(e.at)}</time><strong>{names[e.type] || e.type}</strong><span>{e.path}{e.type === 'scroll_depth' ? ` · ${e.depth}%` : ''}{e.type === 'page_engagement' ? ` · ${e.seconds}s` : ''}{e.type === 'navigation' ? ` → ${e.destination}` : ''}</span></li>)}</ol></details>)}</section></>;
}
function Orders({ data, act, busy }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('paid');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  return <><Heading label="Reconcile, then count" title="Know which orders are paid."><p>Order totals are customer-submitted requests. Check your bank or payment receipt before recording the amount actually received. Revenue covers orders created in the selected period.</p></Heading><section className="growth-panel">{!data.orders.length ? <Empty>No orders in this period. The dashboard will not invent sales.</Empty> : <div className="growth-table-wrap"><table><thead><tr><th>Order / customer</th><th>Requested total</th><th>Payment review</th><th>Action</th></tr></thead><tbody>{data.orders.map(o => <tr key={o.id}><td><strong>{o.id}</strong><small>{o.email} · {date(o.createdAt)}</small><small>{o.items.map(i => `${i.name} (${i.size || 'one size'}) × ${i.quantity}`).join(', ')}</small></td><td>{money(o.total)}</td><td><span className="growth-badge">{(o.review?.status || 'awaiting_payment').replaceAll('_', ' ')}</span>{o.review?.status === 'paid' && <small>{money(o.review.amount)}</small>}</td><td><button onClick={() => { setSelected(o); setStatus(o.review?.status || 'paid'); setAmount(String(o.review?.amount || o.total)); setReference(o.review?.reference || ''); }}>Review</button></td></tr>)}</tbody></table></div>}</section>{selected && <form className="growth-panel growth-form" onSubmit={async e => { e.preventDefault(); if (await act('review_order', { id: selected.id, status, amount, reference }, 'Payment review saved.')) setSelected(null); }}><h2>Review order {selected.id}</h2><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="paid">Paid — receipt verified</option><option value="awaiting_payment">Awaiting payment</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option></select></label><label>Amount received (NGN)<input type="number" min="1" max="10000000" step="0.01" required={status === 'paid'} value={amount} onChange={e => setAmount(e.target.value)} /></label><label>Bank / receipt reference<input required={status === 'paid'} maxLength={150} value={reference} onChange={e => setReference(e.target.value)} /></label><p className="growth-muted">This records your review; it does not move money or issue a refund.</p><div className="growth-actions"><button type="submit" disabled={busy}>Save payment review</button><button type="button" onClick={() => setSelected(null)}>Cancel</button></div></form>}</>;
}
function People({ data }) {
  return <><Heading label="Account activity" title="Who has joined the store."><p>Account creation and latest sign-in come from Firebase. Individual historical login events begin only with the new consented tracking.</p></Heading><div className="growth-stats"><article><p>Accounts loaded</p><strong>{data.accounts.length}</strong><span>All-time account list</span></article><article><p>Tracked logins</p><strong>{data.totals.logins}</strong><span>Selected period, consenting users</span></article><article><p>Tracked signups</p><strong>{data.totals.signups}</strong><span>Selected period, consenting users</span></article></div><section className="growth-panel">{data.accountListTruncated && <p>Showing the first 1,000 accounts; this is not a complete account total.</p>}{!data.accounts.length ? <Empty>No accounts loaded in this view.</Empty> : <div className="growth-table-wrap"><table><thead><tr><th>Account</th><th>Joined</th><th>Last sign-in</th><th>Method</th></tr></thead><tbody>{data.accounts.map(a => <tr key={a.id}><td>{a.email}<small>{a.verified ? 'Email verified' : 'Email not verified'}</small></td><td>{date(a.createdAt)}</td><td>{date(a.lastSignIn)}</td><td>{a.providers.join(', ') || 'Unknown'}</td></tr>)}</tbody></table></div>}</section></>;
}
function Radar({ data, act, busy }) {
  const [filter, setFilter] = useState('all');
  const [notes, setNotes] = useState({});
  const list = data.opportunities.filter(o => filter === 'all' || o.status === filter);
  return <><Heading label="Find relevant places to show up" title="Your opportunity radar."><p>Public search results for Nigerian creators, events, retailers, and communities. Review relevance before reaching out; these are opportunities, not verified customers.</p></Heading><section className="growth-panel"><div className="growth-panel-title"><div><h2>{data.settings.focus}</h2><p className="growth-muted">One query per run · up to 10 results · maximum {data.dailyLimit} searches/day</p></div><button className="growth-primary" disabled={busy || !data.configured.search} onClick={() => act('research', {})}>{busy ? 'Searching…' : 'Find opportunities'}</button></div>{!data.configured.search && <p className="growth-notice">Connect your SerpAPI key in the server settings to enable real searches.</p>}<label>Status<select value={filter} onChange={e => setFilter(e.target.value)}>{['all', 'new', 'shortlisted', 'contacted', 'partnered', 'dismissed'].map(v => <option key={v}>{v}</option>)}</select></label></section>
    <div className="growth-opportunities">{!list.length ? <Empty>No opportunities here yet. Run research after connecting SerpAPI, or change the filter.</Empty> : list.map(o => <article className="growth-panel" key={o.id}><span className="growth-badge">{o.focus}</span><h2><a href={o.url} target="_blank" rel="noreferrer">{o.title} ↗</a></h2><p>{o.snippet}</p><small>Found {date(o.createdAt)} · {o.query}</small><label>Status<select value={o.status} disabled={busy} onChange={e => act('opportunity', { id: o.id, status: e.target.value, notes: notes[o.id] ?? o.notes })}>{['new', 'shortlisted', 'contacted', 'partnered', 'dismissed'].map(v => <option key={v}>{v}</option>)}</select></label><label>Your notes<textarea maxLength={1000} placeholder="Audience fit, rates, next step…" value={notes[o.id] ?? o.notes} onChange={e => setNotes({ ...notes, [o.id]: e.target.value })} /></label><button disabled={busy} onClick={() => act('opportunity', { id: o.id, status: o.status, notes: notes[o.id] ?? o.notes })}>Save notes</button></article>)}</div>
    <section className="growth-panel"><h2>Research history</h2>{data.runs.length ? data.runs.map(r => <div className="growth-row" key={r.id}><div><strong>{r.status}</strong><p>{r.query}</p>{r.error && <p>{r.error}</p>}</div><span>{date(r.at)}{r.results !== undefined ? ` · ${r.results} results` : ''}</span></div>) : <p>No research runs yet.</p>}</section></>;
}

function Studio({ data, act, busy }) {
  const available = PRODUCTS.filter(p => p.inStock && !p.hidden && p.category !== 'unreleased');
  const [productId, setProductId] = useState(available[0]?.id || '');
  const [title, setTitle] = useState('Twenty3 weekly fit');
  const [source, setSource] = useState('instagram');
  const [copy, setCopy] = useState('');
  const [status, setStatus] = useState('draft');
  const [id, setId] = useState('');
  const [copied, setCopied] = useState('');
  const [destination, setDestination] = useState('/shop');
  const product = available.find(p => p.id === productId);
  const url = data.siteUrl ? campaignLink(data.siteUrl, destination, source, title) : '';
  const generate = () => {
    if (!product) return;
    setId(''); setStatus('draft'); setTitle(`${product.name} — wear your world`); setDestination(`/product/${product.id}`);
    setCopy(`${product.name}. A new way to wear your world.\n\nMeet your next Twenty3 fit — ${money(product.price)}. Explore the product page for available sizes and details. Need help choosing your fit? Message us.\n\nDesigned in Lagos. Made for your everyday expression.\nDelivery fee is confirmed separately.\n\nSee the piece through the link below.\n#Twenty3 #NigerianStreetwear #WearYourWorld`);
  };
  const clipboard = async text => { try { await navigator.clipboard.writeText(text); setCopied('Copied.'); } catch { setCopied('Could not copy automatically. Select and copy the text.'); } };
  return <><Heading label="Make a habit of showing up" title="One piece. A week of stories."><p>Create editable campaign drafts and tracked links. Save a draft, review it, then publish it yourself on your chosen channel.</p></Heading><div className="growth-grid"><form className="growth-panel growth-form" onSubmit={e => { e.preventDefault(); act('campaign', { id, title, copy, source, status, destination }, 'Campaign saved.'); }}><h2>Build a product story</h2><label>Featured product<select value={productId} onChange={e => setProductId(e.target.value)}>{available.map(p => <option key={p.id} value={p.id}>{p.name} · {money(p.price)}</option>)}</select></label><button type="button" onClick={generate}>Create a starting draft</button><label>Campaign name<input required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} /></label><label>Channel<select value={source} onChange={e => setSource(e.target.value)}>{['instagram', 'tiktok', 'whatsapp', 'creator'].map(v => <option key={v}>{v}</option>)}</select></label><label>Caption<textarea required rows={9} maxLength={5000} value={copy} onChange={e => setCopy(e.target.value)} placeholder="Choose a product and create a starting draft, or write your own." /></label><label>Link destination<select value={destination} onChange={e => setDestination(e.target.value)}><option value="/shop">Full collection</option>{available.map(p => <option key={p.id} value={`/product/${p.id}`}>{p.name}</option>)}</select></label><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="draft">Draft</option><option value="ready">Ready for review</option><option value="published">Published by me</option></select></label><div className="growth-actions"><button type="submit" disabled={busy}>Save campaign</button><button type="button" disabled={!copy || !url} onClick={() => clipboard(`${copy}\n\n${url}`)}><Copy size={14} /> Copy caption & link</button></div><p role="status">{copied}</p>{url ? <p className="growth-link">{url}</p> : <p>Set SITE_URL on the server to generate your public campaign link.</p>}</form>
    <div><section className="growth-creative"><img src={product?.image || product?.images?.[0]} alt={product?.name || 'Selected product'} /><div><p className="eyebrow">Creative direction</p><h2>Let the details<br />do the talking.</h2><p>Film front, side, and back. Add one close-up of the fabric and one demonstration of the barcode. Use daylight, a clean background, and the real product.</p><p><strong>Next design brief:</strong> start with one existing silhouette. Explore a two-color raglan, a single oversized back graphic, or a tonal chest mark. Ask five target buyers which version they would wear before producing stock.</p></div></section><section className="growth-panel"><h2>Saved campaigns</h2>{!data.campaigns.length ? <p>Saved drafts will appear here.</p> : data.campaigns.map(c => <button className="growth-campaign-item" key={c.id} onClick={() => { setId(c.id); setTitle(c.title); setCopy(c.copy); setSource(c.source); setStatus(c.status); setDestination(c.destination); const p = available.find(p => c.destination === `/product/${p.id}`); if (p) setProductId(p.id); }}><strong>{c.title}</strong><span>{c.source} · {c.status}</span></button>)}</section></div></div>
    <section className="growth-panel"><h2>Your weekly content rhythm</h2><p>Start organically while you learn what people respond to. Your planning budget: {money(data.settings.monthlyBudget)}/month. No ad spend is authorized or charged here.</p><div className="growth-week">{weeklyPlan.map(([day, title, text]) => <article key={day}><span>{day}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section></>;
}
function Connections({ data, act, busy }) {
  const [settings, setSettings] = useState(data.settings);
  return <><Heading label="Your operating settings" title="Connect. Choose. Start."><p>Research runs once daily when enabled. Campaigns stay drafts until you publish them.</p></Heading><div className="growth-stats">{[['Visitor analytics', data.configured.analytics], ['SerpAPI research', data.configured.search], ['Daily schedule secret', data.configured.cron]].map(([name, ready]) => <article key={name}><p>{name}</p><strong className="growth-connection">{ready ? 'Configured' : 'Needs setup'}</strong><span>Server configuration</span></article>)}</div><form className="growth-panel growth-form" onSubmit={e => { e.preventDefault(); act('settings', settings); }}><h2>Nigeria nationwide</h2><p>Queries rotate across Lagos, Abuja, Port Harcourt, Ibadan, Enugu, Benin City, and Kano.</p><label>Research focus<select value={settings.focus} onChange={e => setSettings({ ...settings, focus: e.target.value })}>{FOCUSES.map(v => <option key={v}>{v}</option>)}</select></label><label>Monthly ad planning budget (NGN)<input type="number" min="0" max="10000000" value={settings.monthlyBudget} onChange={e => setSettings({ ...settings, monthlyBudget: e.target.value })} /></label><label className="growth-toggle"><input type="checkbox" checked={settings.enabled} onChange={e => setSettings({ ...settings, enabled: e.target.checked })} /> Enable daily opportunity research</label><p>Scheduled for 09:00 UTC (10:00 Nigeria time); hosting may delay execution within that hour. Search-provider credits apply. Manual and daily runs share a cap of {data.dailyLimit} queries/day.</p><button disabled={busy}>Save settings</button></form><Setup /></>;
}
