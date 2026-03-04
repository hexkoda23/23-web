import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const shopLinks = [
  { label: 'New Arrivals', to: '/shop?category=new' },
  { label: 'Unreleased', to: '/shop?category=unreleased' },
  { label: 'Outerwear', to: '/shop?category=outerwear' },
  { label: 'Footwear', to: '/shop?category=shoes' },
];
const infoLinks = [
  { label: 'Our Story', to: '/about' },
  { label: 'Lookbook', to: '/lookbook' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white rounded-t-[2.5rem] mt-[-2.5rem] relative z-10 pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand — col-span-5 */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center">
                <span className="font-mono font-bold text-sm text-white">23</span>
              </div>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/40">
                The Brand
              </span>
            </div>
            <p className="text-white/35 text-sm font-light leading-relaxed max-w-xs mb-6">
              Defining modern luxury through personalized streetwear. Born in Lagos. Made for the world.
            </p>
            <div className="flex items-center gap-5 mb-8">
              <a href="#" className="text-white/30 hover:text-[var(--accent)] transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-white/30 hover:text-[var(--accent)] transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-white/30 hover:text-[var(--accent)] transition-colors"><Facebook size={18} /></a>
            </div>
          </div>

          {/* Shop — col-span-3 */}
          <div className="md:col-span-3">
            <h4 className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--accent)] mb-6">Shop</h4>
            <ul className="space-y-4">
              {shopLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="font-mono text-[0.62rem] tracking-[0.12em] uppercase text-white/35 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info — col-span-4 */}
          <div className="md:col-span-4">
            <h4 className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--accent)] mb-6">Info</h4>
            <ul className="space-y-4 mb-10">
              {infoLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="font-mono text-[0.62rem] tracking-[0.12em] uppercase text-white/35 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Newsletter mini */}
            <div>
              <p className="font-mono text-[0.58rem] tracking-[0.15em] uppercase text-white/30 mb-3">Subscribe for exclusive drops</p>
              <form className="flex border-b border-white/10 pb-2 focus-within:border-[var(--accent)]/50 transition-colors">
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="bg-transparent flex-1 font-mono text-[0.58rem] tracking-[0.12em] uppercase text-white placeholder-white/20 outline-none"
                />
                <button type="submit" className="font-mono text-[0.58rem] tracking-[0.15em] uppercase text-[var(--accent)] hover:text-white transition-colors">
                  →
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[0.58rem] tracking-[0.12em] uppercase text-white/20">
            © {new Date().getFullYear()} 23 Look. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link to="/terms" className="font-mono text-[0.58rem] tracking-[0.12em] uppercase text-white/20 hover:text-white/50 transition-colors">Terms</Link>
            <Link to="/privacy" className="font-mono text-[0.58rem] tracking-[0.12em] uppercase text-white/20 hover:text-white/50 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
