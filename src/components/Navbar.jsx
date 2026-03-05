import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchModal from './SearchModal';

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

  // Detect if we're on a dark-hero page (Landing, Home)
  const isDarkPage = ['/', '/lookbook'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const navBg = isScrolled
    ? 'bg-black/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]'
    : isDarkPage ? 'bg-transparent' : 'bg-white border-b border-black/[0.06]';

  const textColor = isScrolled || isDarkPage ? 'text-white' : 'text-black';

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-500 py-5 ${navBg}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex justify-between items-center">

          {/* Logo mark */}
          <Link to="/" className="z-50 flex items-center gap-3">
            <div className={`w-9 h-9 border flex items-center justify-center transition-colors ${isScrolled || isDarkPage ? 'border-white/30 text-white' : 'border-black/30 text-black'
              }`}>
              <span className="font-mono font-bold text-sm tracking-tighter">23</span>
            </div>
            <span className={`hidden sm:block font-mono text-[0.62rem] tracking-[0.2em] uppercase transition-colors ${isScrolled || isDarkPage ? 'text-white/60' : 'text-black/50'
              }`}>
              The Brand
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-mono text-[0.62rem] tracking-[0.18em] uppercase transition-all duration-200 relative group ${location.pathname === link.to
                  ? isScrolled || isDarkPage ? 'text-white' : 'text-black'
                  : isScrolled || isDarkPage ? 'text-white/50 hover:text-white' : 'text-black/45 hover:text-black'
                  }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className="absolute -bottom-1 left-0 w-full h-px bg-[var(--accent)]" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5 z-50">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`hidden md:block transition-colors ${isScrolled || isDarkPage ? 'text-white/60 hover:text-white' : 'text-black/50 hover:text-black'}`}
            >
              <Search size={17} />
            </button>
            <Link
              to={currentUser ? '/account' : '/login'}
              className={`hidden md:block transition-colors ${isScrolled || isDarkPage ? 'text-white/60 hover:text-white' : 'text-black/50 hover:text-black'}`}
            >
              <User size={17} />
            </Link>
            <button
              onClick={toggleCart}
              className={`relative transition-colors ${isScrolled || isDarkPage ? 'text-white/80 hover:text-white' : 'text-black/70 hover:text-black'}`}
            >
              <ShoppingBag size={17} />
              {getCartCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[var(--accent)] text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold">
                  {getCartCount()}
                </span>
              )}
            </button>
            <button
              className={`lg:hidden transition-colors ${isScrolled || isDarkPage ? 'text-white' : 'text-black'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black z-40 flex flex-col pt-28 px-8 pb-12 lg:hidden"
          >
            <div className="flex flex-col gap-1 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={link.to}
                    className="block py-4 border-b border-white/[0.06] font-mono text-[0.62rem] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="pt-8">
              <Link
                to="/shop"
                className="w-full flex items-center justify-center py-4 border border-white/20 font-mono text-[0.62rem] tracking-[0.2em] uppercase text-white hover:bg-white hover:text-black transition-all duration-300"
              >
                Shop Now →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
