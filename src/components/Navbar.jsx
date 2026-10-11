import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Search, ArrowUpRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from './BrandLogo';
import MusicPlayer from './MusicPlayer';
import SearchModal from './SearchModal';

const links = [['New arrivals', '/shop?category=new'], ['Collection', '/shop'], ['Lookbook', '/lookbook'], ['23 AI Studio', '/ai-studio'], ['Create a fit', '/outfit-generator'], ['The house', '/about']];
const services = [['Your identity', '/identity-forge'], ['My account', '/account'], ['Messages', '/messages'], ['Size guide', '/size-guide'], ['Client services', '/contact'], ['Questions & answers', '/faq']];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { getCartCount, toggleCart } = useCart();
  const { currentUser } = useAuth();
  const location = useLocation();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => {
      if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false); triggerRef.current?.focus(); }
      if (e.key === 'Tab' && menuOpen) {
        const controls = menuRef.current?.querySelectorAll('a, button');
        if (!controls?.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    if (menuOpen) menuRef.current?.querySelector('button')?.focus();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [menuOpen, searchOpen]);
  const closeMenu = () => { setMenuOpen(false); triggerRef.current?.focus(); };
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className={`house-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="house-announcement">From Lagos to the world <span>·</span> Complimentary shipping on orders over ₦50,000</div>
      <div className="house-masthead">
        <div className="header-start"><button ref={triggerRef} onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><Menu size={20} strokeWidth={1.4} /><span>Menu</span></button><MusicPlayer className="header-music" /><Link to="/contact" className="client-link">Client services</Link></div>
        <Link to="/" aria-label="Twenty3 home" className="masthead-logo"><BrandLogo /></Link>
        <div className="header-actions"><button onClick={() => setSearchOpen(true)} aria-label="Search products"><Search size={20} strokeWidth={1.4} /></button><Link to={currentUser ? '/account' : '/login'} aria-label={currentUser ? 'My account' : 'Sign in'}><User size={20} strokeWidth={1.4} /></Link><button onClick={toggleCart} aria-label={`Shopping bag, ${getCartCount()} items`} className="bag-action"><ShoppingBag size={20} strokeWidth={1.4} />{getCartCount() > 0 && <span className="bag-count">{getCartCount()}</span>}</button></div>
      </div>
      <nav className="house-nav" aria-label="Main navigation">{links.map(([label, to]) => <Link key={to} to={to} aria-current={`${location.pathname}${location.search}` === to ? 'page' : undefined}>{label}</Link>)}</nav>
    </header>
    {menuOpen && <div className="menu-overlay" onClick={closeMenu}><section ref={menuRef} className="house-menu" role="dialog" aria-modal="true" aria-label="Explore Twenty3" onClick={e => e.stopPropagation()}><div className="menu-top"><span className="eyebrow">Explore Twenty3</span><button onClick={closeMenu} aria-label="Close menu"><X size={24} strokeWidth={1.2} /></button></div><nav aria-label="Collection navigation">{links.map(([label, to]) => <Link key={to} to={to} onClick={closeMenu}>{label}<ArrowUpRight size={18} strokeWidth={1} /></Link>)}</nav><div className="menu-services">{services.map(([label, to]) => <Link key={to} to={to} onClick={closeMenu}>{label}</Link>)}</div><p className="menu-note">Luxury. Identity. Exclusivity.<br />Lagos, Nigeria.</p></section></div>}
    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
  </>;
}
