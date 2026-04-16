import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const shopLinks = [
  { label: 'New Arrivals', to: '/shop?category=new' },
  { label: 'Unreleased', to: '/shop?category=unreleased' },
  { label: 'Outerwear', to: '/shop?category=outerwear' },
  { label: 'Footwear', to: '/shop?category=shoes' },
];
const infoLinks = [
  { label: 'Our Story', to: '/about' },
  { label: 'Lookbook', to: '/lookbook' },
  { label: 'Generative AI', to: '/outfit-generator' },
  { label: 'FAQ', to: '/faq' },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A0A0A] text-white pt-24 pb-12 relative z-10 overflow-hidden rounded-t-[40px] mt-[-40px]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

        {/* Giant "FROM23" Top Treatment */}
        <div className="mb-20 text-center select-none overflow-hidden" data-cursor="DRAG">
          <h2
            className="font-display uppercase tracking-[-0.04em] font-black w-full"
            style={{
              fontSize: 'clamp(5rem, 25vw, 25rem)',
              lineHeight: 0.8,
              WebkitTextStroke: '1px rgba(255,255,255,0.15)',
              color: 'transparent'
            }}
          >
            23
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 items-start">

          {/* Shop — col-span-3 */}
          <div className="md:col-span-3">
            <h4 className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-[var(--accent)] mb-6">Shop</h4>
            <ul className="space-y-4">
              {shopLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="nav-link font-mono text-[11px] tracking-[0.12em] uppercase text-white/50 hover:text-[var(--accent)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info — col-span-3 */}
          <div className="md:col-span-3">
            <h4 className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-[var(--accent)] mb-6">Info</h4>
            <ul className="space-y-4">
              {infoLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="nav-link font-mono text-[11px] tracking-[0.12em] uppercase text-white/50 hover:text-[var(--accent)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company — col-span-3 */}
          <div className="md:col-span-3">
            <h4 className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-[var(--accent)] mb-6">Company</h4>
            <ul className="space-y-4 border-l border-white/10 pl-6 h-full">
              <li>
                <p className="font-mono text-[11px] tracking-[0.12em] text-white/30 uppercase leading-relaxed max-w-[200px]">
                  Based in Lagos, Nigeria.<br />Shipping Worldwide.
                </p>
              </li>
              <li className="pt-4">
                <Link to="/contact" className="nav-link font-mono text-[11px] tracking-[0.12em] uppercase text-white hover:text-[var(--accent)] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect / Payments — col-span-3 */}
          <div className="md:col-span-3 flex flex-col justify-start">
            <h4 className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-[var(--accent)] mb-6">Connect</h4>
            <div className="flex flex-col gap-6">
              <a href="https://instagram.com/shop23" target="_blank" className="nav-link font-mono text-[11px] tracking-[0.12em] uppercase text-white hover:text-[var(--accent)] w-max">
                Instagram ↗
              </a>
              <a href="#" className="nav-link font-mono text-[11px] tracking-[0.12em] uppercase text-white hover:text-[var(--accent)] w-max">
                Twitter ↗
              </a>

              <div className="mt-8">
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/30 mb-4">Secure Payment</p>
                <div className="flex gap-3 items-center opacity-30 invert">
                  {/* Simplistic Payment Icons via Unicode or SVG */}
                  <span className="text-2xl" title="Visa">💳</span>
                  <span className="text-2xl" title="Mastercard">💵</span>
                  <span className="font-bold tracking-tighter" title="Paystack">P</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col-reverse md:flex-row justify-between items-center gap-6">
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/30">
            © {new Date().getFullYear()} 23. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link to="/terms" className="nav-link font-mono text-[10px] tracking-[0.12em] uppercase text-white/60 hover:text-[var(--accent)] transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="nav-link font-mono text-[10px] tracking-[0.12em] uppercase text-white/60 hover:text-[var(--accent)] transition-colors">Privacy Policy</Link>
          </div>

          <button
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-black hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300"
            title="Back to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
