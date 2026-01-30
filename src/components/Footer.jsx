
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="h-10">
              <BrandLogo className="h-full" />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Defining modern luxury through minimalist design and premium craftsmanship.
              Born in 2023.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/shop?category=tops" className="hover:text-black transition-colors">Tops</Link></li>
              <li><Link to="/shop?category=bottoms" className="hover:text-black transition-colors">Bottoms</Link></li>
              <li><Link to="/shop?category=outerwear" className="hover:text-black transition-colors">Outerwear</Link></li>
              <li><Link to="/shop?category=shoes" className="hover:text-black transition-colors">Footwear</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900">Support</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/faq" className="hover:text-black transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-black transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-black transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900">Newsletter</h4>
            <p className="text-sm text-gray-500">Subscribe for exclusive drops and early access.</p>
            <form className="flex border-b border-black pb-2">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-transparent w-full outline-none text-sm placeholder-gray-400"
              />
              <button type="submit" className="text-xs font-bold uppercase hover:text-gray-500">
                Join
              </button>
            </form>
            <div className="flex space-x-6 pt-4">
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><Facebook size={20} /></a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 text-xs text-gray-400">
          <p>&copy; 2025 23Look. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
