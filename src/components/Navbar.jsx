
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import SearchModal from './SearchModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getCartCount, toggleCart } = useCart();
  const { currentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="z-50 flex items-center">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/lookbook" className="text-sm uppercase tracking-widest hover:text-gray-500 transition-colors">Lookbook</Link>
            <Link to="/shop" className="text-sm uppercase tracking-widest hover:text-gray-500 transition-colors">Shop</Link>
            <Link to="/outfit-generator" className="text-sm uppercase tracking-widest hover:text-gray-500 transition-colors">Outfit Generator</Link>
            <Link to="/about" className="text-sm uppercase tracking-widest hover:text-gray-500 transition-colors">About</Link>
            <Link to="/faq" className="text-sm uppercase tracking-widest hover:text-gray-500 transition-colors">FAQ</Link>
            <Link to="/contact" className="text-sm uppercase tracking-widest hover:text-gray-500 transition-colors">Contact</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6 z-50">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hover:text-gray-500 transition-colors hidden md:block">
              <Search size={20} />
            </button>
            <Link to={currentUser ? "/account" : "/login"} className="hover:text-gray-500 transition-colors hidden md:block">
              <User size={20} />
            </Link>
            <button onClick={toggleCart} className="relative hover:text-gray-500 transition-colors">
              <ShoppingBag size={20} />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </button>
            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-40 pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-6 text-center">
              <Link to="/lookbook" className="text-2xl uppercase font-light">Lookbook</Link>
              <Link to="/shop" className="text-2xl uppercase font-light">Shop</Link>
              <Link to="/outfit-generator" className="text-2xl uppercase font-light">Outfit Generator</Link>
              <Link to="/about" className="text-2xl uppercase font-light">About</Link>
              <Link to="/faq" className="text-2xl uppercase font-light">FAQ</Link>
              <Link to="/contact" className="text-2xl uppercase font-light">Contact</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
