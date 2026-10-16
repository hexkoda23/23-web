import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import BrandLogo from './BrandLogo';
const groups = [
  ['Collection', [['New arrivals', '/shop?category=new'], ['Unreleased concepts', '/shop?category=unreleased'], ['Tops', '/shop?category=tops'], ['Bottoms', '/shop?category=bottoms'], ['Outerwear', '/shop?category=outerwear'], ['Footwear', '/shop?category=shoes'], ['Accessories', '/shop?category=accessories']]],
  ['The house', [['Our story', '/about'], ['Lookbook', '/lookbook'], ['23 AI Studio', '/ai-studio'], ['Generate a fit', '/outfit-generator'], ['Your identity', '/identity-forge']]],
  ['Client services', [['Contact us', '/contact'], ['Questions & answers', '/faq'], ['Size guide', '/size-guide'], ['My account', '/account'], ['Messages', '/messages'], ['Shopping bag', '/cart'], ['Privacy & analytics', '/privacy']]],
];
export default function Footer() {
  return <footer className="house-footer"><div className="footer-services"><p className="eyebrow">The Twenty3 experience</p><div><span>Personal identity in every piece</span><span>Designed in Lagos</span><span>Shipping worldwide</span></div></div><div className="footer-columns">{groups.map(([title, links]) => <div key={title}><h3>{title}</h3>{links.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}</div>)}<div><h3>Stay connected</h3><p>Exclusive pieces. Individual stories.<br />From Lagos to the world.</p><a href="https://www.instagram.com/twentythreepreppy?igsh=MXZnY3MybjY1MXVvbA==" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={12} /></a><a href="https://wa.me/2348107869063" target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={12} /></a><Link to="/signup">Join Twenty3 <ArrowUpRight size={12} /></Link><p className="footer-payment">Bank transfer · Receipt confirmation</p></div></div><div className="footer-wordmark"><BrandLogo /></div><div className="footer-bottom"><p>© {new Date().getFullYear()} TWENTY3™. All rights reserved.</p><p>Lagos, Nigeria · NGN ₦</p><button aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top <ArrowUp size={14} /></button></div></footer>;
}
