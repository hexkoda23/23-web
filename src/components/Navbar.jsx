import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchModal from './SearchModal';
import Marquee from './Marquee';

const navLinks = [
  { label: 'Lookbook', to: '/lookbook' },
  { label: 'Shop', to: '/shop' },
  { label: 'Generate Fit', to: '/outfit-generator' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getCartCount, toggleCart } = useCart();
  const { currentUser } = useAuth();
  const location = useLocation();

  const isDarkPage = ['/', '/lookbook'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  const navBg = isScrolled
    ? 'bg-black/70 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)]'
    : isDarkPage ? 'bg-transparent' : 'bg-white border-b border-black/[0.06]';

  const textColor = isScrolled || isDarkPage ? 'text-white' : 'text-black';

  return (
    <>
      <div className={`fixed w-full z-50 transition-all duration-500`}>
        {/* Main Navbar */}
        <nav className={`py-5 transition-colors duration-500 ${navBg}`}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex justify-between items-center">

            {/* Logo mark */}
            <Link to="/" className="z-50 flex items-center gap-3 group" data-cursor="VIEW">
              <div className={`w-9 h-9 border flex items-center justify-center transition-colors group-hover:border-[var(--accent)] ${isScrolled || isDarkPage ? 'border-white/30 text-white' : 'border-black/30 text-black'}`}>
                <span className="font-mono font-bold text-sm tracking-tighter">23</span>
              </div>
              <span className={`hidden sm:block font-mono text-[0.62rem] tracking-[0.2em] uppercase transition-colors group-hover:text-[var(--accent)] ${isScrolled || isDarkPage ? 'text-white/60' : 'text-black/50'}`}>
                The Brand
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link font-mono text-[0.68rem] font-medium tracking-[0.15em] uppercase transition-all duration-200 ${location.pathname === link.to
                    ? isScrolled || isDarkPage ? 'text-white' : 'text-black'
                    : isScrolled || isDarkPage ? 'text-white/50 hover:text-white' : 'text-black/45 hover:text-black'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5 z-50">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`hidden md:block transition-colors hover:text-[var(--accent)] ${isScrolled || isDarkPage ? 'text-white/60' : 'text-black/50'}`}
              >
                <Search size={17} />
              </button>
              <Link
                to={currentUser ? '/account' : '/login'}
                className={`hidden md:block transition-colors hover:text-[var(--accent)] ${isScrolled || isDarkPage ? 'text-white/60' : 'text-black/50'}`}
              >
                <User size={17} />
              </Link>

              <button
                onClick={toggleCart}
                className={`relative transition-colors hover:text-[var(--accent)] ${isScrolled || isDarkPage ? 'text-white/80' : 'text-black/70'}`}
              >
                <ShoppingBag size={17} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-black w-2 h-2 rounded-full ring-2 ring-black" />
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className={`lg:hidden transition-colors hover:text-[var(--accent)] ${isScrolled || isDarkPage || isMobileMenuOpen ? 'text-white' : 'text-black'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ zIndex: 60 }} // ensure it is above the menu
              >
                <motion.div animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}>
                  {isMobileMenuOpen ? <X size={26} color="black" /> : <Menu size={22} />}
                </motion.div>
              </button>
            </div>
          </div>
        </nav>

        {/* Marquee Tape below Navbar */}
        <div className={`overflow-hidden transition-all duration-500 border-b ${isScrolled || isDarkPage ? 'bg-black/40 border-white/10 backdrop-blur-md' : 'bg-white border-black/10'}`}>
          <Marquee
            text="NEW ARRIVALS · FREE SHIPPING OVER ₦50,000 · 23 — WEAR YOUR WORLD · "
            speed="30s"
            className={`py-1.5 font-mono text-[0.55rem] tracking-[0.15em] uppercase font-medium ${isScrolled || isDarkPage ? 'text-white/60' : 'text-black/60'}`}
          />
        </div>
      </div>

      {/* Full Screen Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "tween", duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[55] lg:hidden bg-[var(--accent)] flex flex-col pt-32 px-8 pb-12 overflow-hidden"
          >
            {/* Big typographic background texture */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/5 font-display font-black text-[25vw] whitespace-nowrap pointer-events-none select-none">
              23
            </div>

            <div className="flex flex-col gap-6 flex-1 relative z-10 mt-10">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.08), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.to}
                    className="block font-display text-black font-bold text-5xl uppercase tracking-tighter hover:opacity-50 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="pt-8 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link
                to="/shop"
                className="w-full flex items-center justify-center py-5 bg-black font-mono text-[0.62rem] tracking-[0.2em] uppercase text-white hover:bg-white hover:text-black transition-all duration-300"
              >
                Shop Collection →
              </Link>

              <div className="mt-8 flex justify-center gap-8">
                <a href="#" className="font-mono text-xs uppercase tracking-widest text-black/60 font-bold">Instagram</a>
                <a href="#" className="font-mono text-xs uppercase tracking-widest text-black/60 font-bold">Twitter</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
