import { useState } from 'react';
import { Link } from 'react-router-dom';
import ScanFilm from '../components/ScanFilm';
import { CRAFTS, SAMPLE_PROFILE } from '../../server/profile-model';

const steps = [['01', 'Wear it', 'Every Twenty3 piece carries a code that opens your own page.'], ['02', 'Get scanned', 'Someone notices your fit, points a phone at the code and lands on your work.'], ['03', 'Get booked', 'Your page shows what you make and how to hire you, in one button.']];
const page = [['Your own page', 'Your craft, your city, your best work and every way to find you.'], ['A Work with me button', 'WhatsApp, email or a link. Whoever scans you is one tap from an enquiry.'], ['Proof it works', 'See how many times your outfit was scanned, every week, in your account.']];
const empty = { name: '', email: '', craft: '', city: '', instagram: '', link: '', why: '' };

export default function Creatives() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    setStatus('sending'); setError('');
    try {
      const response = await fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not send your application. Please try again.');
      setStatus('sent'); setForm(empty);
    } catch (err) { setError(err.message); setStatus('idle'); }
  };
  return <div className="creatives-page">
    <section className="creatives-hero"><p className="eyebrow">For creatives</p><h1>Your work,<br /><em>on your back.</em></h1><p>Twenty3 turns what you wear into an advert for what you make. One code on your outfit, and anyone who notices you can see your work and hire you. The First 23 creatives we select get a free piece.</p><div className="scan-demo-links"><a href="#apply" className="house-button">Apply to the First 23</a><Link to={`/profile/${SAMPLE_PROFILE.id}`} className="text-link">See a sample profile</Link></div></section>
    <section className="creatives-steps">{steps.map(([number, title, body]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{body}</p></article>)}</section>
    <section className="creatives-film"><ScanFilm /><div><p className="eyebrow">What you get</p><h2>A portfolio that<br /><em>walks into the room.</em></h2>{page.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}<Link to="/identity-forge" className="text-link">Create your profile</Link></div></section>
    <section className="creatives-apply" id="apply"><div><p className="eyebrow">The First 23</p><h2>We are looking for<br /><em>23 Nigerian creatives.</em></h2><p>Photographers, stylists, musicians, designers, painters, writers. The first faces of a network where people find each other through what they wear, and collaborate. Tell us what you make.</p><p className="creatives-offer">Selected creatives get a free Twenty3 piece. Limited to the First 23.</p></div>
      {status === 'sent' ? <div className="creatives-sent" role="status"><h3>Thank you.</h3><p>We read every application ourselves. If it is a fit, we will reach out by email or Instagram.</p></div> : <form onSubmit={submit}><label>Name<input name="name" value={form.name} onChange={change} required maxLength={80} /></label><label>Email<input type="email" name="email" value={form.email} onChange={change} required maxLength={120} /></label><label>Your craft<input name="craft" list="apply-crafts" value={form.craft} onChange={change} required maxLength={60} /><datalist id="apply-crafts">{CRAFTS.map(craft => <option key={craft} value={craft} />)}</datalist></label><label>City<input name="city" value={form.city} onChange={change} maxLength={60} /></label><label>Instagram<input name="instagram" value={form.instagram} onChange={change} maxLength={60} /></label><label>Link to your work<input name="link" value={form.link} onChange={change} maxLength={200} /></label><label className="creatives-wide">Why you<textarea name="why" rows={3} value={form.why} onChange={change} maxLength={600} /></label>{error && <p className="creatives-error" role="alert">{error}</p>}<button className="house-button" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Apply'}</button></form>}
    </section>
  </div>;
}
