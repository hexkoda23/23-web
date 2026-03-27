import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import { X, Play, Pause, Grid, Layers, Film, ChevronLeft, ChevronRight } from 'lucide-react';

// Replace the static <h2> with this:
function WordReveal({ text, className }) {
  const words = text.split(' ');
  return (
    <h2 className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

// Animated counter hook — THCO style rolling numbers
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// All 6 mannequin images
const MANNEQUIN_IMAGES = [
  '/maniqin/WhatsApp Image 2026-03-04 at 1.42.49 PM.jpeg',
  '/maniqin/WhatsApp Image 2026-03-04 at 1.42.53 PM.jpeg',
  '/maniqin/WhatsApp Image 2026-03-04 at 1.42.57 PM.jpeg',
  '/maniqin/WhatsApp Image 2026-03-04 at 1.43.03 PM.jpeg',
  '/maniqin/WhatsApp Image 2026-03-04 at 1.43.07 PM.jpeg',
  '/maniqin/WhatsApp Image 2026-03-04 at 1.43.09 PM.jpeg',
];

// Auto-rotating mannequin carousel card
function MannequinRotator() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % MANNEQUIN_IMAGES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="editorial-card group relative overflow-hidden min-h-[240px] bg-[#111111]">
      {/* Crossfading images */}
      {MANNEQUIN_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Mannequin look ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="section-tag text-[var(--accent)] mb-1.5">Styled by 23</div>
        <h3 className="font-black text-white text-lg uppercase tracking-tight mb-3">Collections</h3>
        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {MANNEQUIN_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all duration-300"
            >
              <span className={`block rounded-full transition-all duration-300 ${i === current
                ? 'w-4 h-1.5 bg-[var(--accent)]'
                : 'w-1.5 h-1.5 bg-white/30'
                }`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


const HERO_IMAGES = [
  '/lookbook/JF-1.JPG',
  '/lookbook/JF-6.JPG',
  '/lookbook/JF-8.JPG',
  '/lookbook/JF-11.JPG',
  '/lookbook/JF-15.JPG',
  '/lookbook/JF-22.JPG',
  '/lookbook/JF-25.JPG',
  '/lookbook/18.jpg',
  '/lookbook/6.jpg',
  '/lookbook/1.jpg',
];

const MARQUEE_ITEMS = [
  'LUXURY WEAR', '— BORN 2025 —', 'PERSONALIZED FOR YOU',
  '— LAGOS NIGERIA —', 'WEAR YOUR IDENTITY', '— COLLECTION 26 —',
  'LUXURY WEAR', '— BORN 2025 —', 'PERSONALIZED FOR YOU',
  '— LAGOS NIGERIA —', 'WEAR YOUR IDENTITY', '— COLLECTION 26 —',
];

const stats = [
  { value: 23, suffix: '', label: 'The Number', sub: 'Our founding identity' },
  { value: 100, suffix: '%', label: 'Personalized', sub: 'Every piece is unique' },
  { value: 3, suffix: '+', label: 'Years', sub: 'Redefining luxury' },
  { value: 50, suffix: '+', label: 'Pieces Sold', sub: 'And counting' },
];

function StatCard({ stat, statsInView, index }) {
  const count = useCounter(stat.value, 1800, statsInView);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={statsInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="glass-dark rounded-2xl p-7 hover:border-[var(--accent)]/30 transition-colors"
    >
      <p className="font-black text-white mb-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
        {count}{stat.suffix}
      </p>
      <p className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-white/70 mb-1">
        {stat.label}
      </p>
      <p className="font-mono text-[0.58rem] tracking-[0.1em] text-white/30">{stat.sub}</p>
    </motion.div>
  );
}

export default function Home() {
  const arrivalIds = ['top-7', 'gym-1', 'acc-5', 'bottom-10'];
  const newArrivals = arrivalIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  const [heroIndex, setHeroIndex] = useState(0);

  // Feature 2: Cursor Spotlight Effect on Hero Section
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // Feature 3: Horizontal Scroll "Featured Drop" Strip
  const stripRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - stripRef.current.offsetLeft);
    setScrollLeft(stripRef.current.scrollLeft);
  };
  const onMouseMoveDrag = (e) => {
    if (!isDragging) return;
    const x = e.pageX - stripRef.current.offsetLeft;
    stripRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
  };
  const onMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 2000); // Changed to 2s
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white">

      {/* ── HERO — Full dark, THCO dramatic ── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative h-screen w-full overflow-hidden bg-[#0A0A0A]"
      >
        {/* Spotlight Effect */}
        <div
          className="absolute pointer-events-none z-20 transition-opacity duration-300"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(200,169,110,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div className="absolute inset-0">
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt="23 Collection"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === heroIndex ? 'opacity-90' : 'opacity-0'}`}
            />
          ))}
          {/* Gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        </div>

        {/* Dot grid overlay — THCO pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6 lg:px-16 max-w-[1400px] mx-auto left-0 right-0">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* THCO-style section tag */}
            <div className="section-tag text-[var(--accent)] mb-6">
              Spring Summer 2026
            </div>

            <h1
              className="font-black text-white leading-[0.9] tracking-[-0.03em] mb-8 uppercase"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
            >
              Wear Your<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #C8A96E 0%, #F5DFA0 50%, #C8A96E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Identity.
              </span>
            </h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-mono text-[0.62rem] tracking-[0.2em] uppercase hover:bg-[var(--accent)] transition-all duration-300 group"
              >
                Shop Collection
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/lookbook"
                className="inline-flex items-center gap-3 font-mono text-[0.62rem] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors"
              >
                View Lookbook →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom right label — THCO style */}
        <div className="absolute bottom-8 right-6 lg:right-16">
          <p className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-white/30">
            Lagos, Nigeria — Est. 2025
          </p>
        </div>
      </section>

      {/* ── MARQUEE STRIP — THCO scrolling text banner ── */}
      <div className="bg-[var(--accent)] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="marquee-track flex gap-12 items-center">
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-black font-medium flex-shrink-0">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── EDITORIAL FEATURE — THCO 2-column grid ── */}
      <section className="py-20 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="section-tag mb-3">Collections</div>
              <h2
                className="font-black text-white uppercase leading-[0.95] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
              >
                The World<br />of 23
              </h2>
            </div>
            <Link
              to="/lookbook"
              className="hidden md:inline-flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors"
            >
              Full Lookbook <ArrowRight size={12} />
            </Link>
          </div>

          {/* THCO 3-col editorial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Col 1 — Big hero card */}
            <Link to="/shop?category=tops" className="editorial-card group block md:row-span-2 aspect-[4/5] md:aspect-auto">
              <img src="/lookbook/3.jpg" alt="23 Collection" className="w-full h-full object-cover" />
              <div className="overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <div className="section-tag text-[var(--accent)] mb-2">Collection 01</div>
                <h3 className="font-black text-white text-2xl uppercase tracking-tight">The Essentials</h3>
                <p className="text-white/50 font-mono text-[0.62rem] tracking-[0.15em] uppercase mt-2 flex items-center gap-2">
                  Explore <ArrowRight size={10} />
                </p>
              </div>
            </Link>

            {/* Col 2 — Unreleased */}
            <Link to="/shop?category=unreleased" className="editorial-card group block min-h-[240px]">
              <img src="/wardrobe/23xlongbrown.jpg" alt="Unreleased" className="w-full h-full object-cover" />
              <div className="overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="section-tag text-[var(--accent)] mb-1.5">Drop Soon</div>
                <h3 className="font-black text-white text-xl uppercase tracking-tight">Unreleased</h3>
              </div>
            </Link>

            {/* Col 3 — Mannequin Rotator */}
            <MannequinRotator />

            {/* Col 2 — AI Outfit Generator (spans bottom) */}
            <Link to="/outfit-generator" className="editorial-card group block relative overflow-hidden min-h-[240px] flex items-center justify-center p-10 md:col-span-2">
              {/* Background image */}
              <img
                src="/wardrobe/23xracing.jpg"
                alt="Outfit Generator"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
              <div className="text-center relative z-10">
                <div className="section-tag justify-center mb-4">AI Powered</div>
                <h3 className="font-black text-white text-2xl uppercase tracking-tight mb-3">Outfit Generator</h3>
                <p className="text-white/60 font-mono text-[0.6rem] tracking-[0.15em] uppercase">
                  Let AI style you →
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE 3: Horizontal Scroll "Featured Drop" Strip */}
      <section className="py-20 bg-[#111111] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="section-tag mb-3">Latest Drop</div>
              <h2 className="font-black text-white uppercase" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                Featured<br />Pieces
              </h2>
            </div>
            {/* Drag hint */}
            <p className="font-mono text-[0.58rem] tracking-[0.18em] text-white/20 uppercase hidden md:block">
              ← Drag to explore →
            </p>
          </div>
        </div>

        <div
          ref={stripRef}
          className="flex gap-6 px-6 lg:px-10 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
          style={{ scrollSnapType: 'x mandatory' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMoveDrag}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Show first 6 products from PRODUCTS array */}
          {PRODUCTS.slice(0, 6).map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[280px] md:w-[320px] group"
              style={{ scrollSnapAlign: 'start' }}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              {/* Card image — tall portrait */}
              <div className="relative overflow-hidden aspect-[3/4] bg-[#1A1A1A] mb-4">
                <img
                  src={product.image || product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  draggable={false}
                />
                {/* Price badge */}
                <div className="absolute top-4 right-4 glass-dark px-3 py-1.5 rounded-full">
                  <span className="font-mono text-[0.6rem] text-white/80 tracking-wider">
                    ₦{product.price?.toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Card info */}
              <div>
                <p className="font-mono text-[0.58rem] tracking-[0.16em] uppercase text-[var(--accent)] mb-1">
                  {product.category}
                </p>
                <h4 className="font-bold text-white text-sm uppercase tracking-tight">{product.name}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP — THCO animated numbers ── */}
      <section ref={statsRef} className="py-20 bg-[#111111] border-y border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} statsInView={statsInView} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE 1: Linear-Style "Why 23" Feature Cards Section */}
      <section className="py-24 lg:py-36 bg-[#0A0A0A] border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          {/* Section header */}
          <div className="mb-20 flex items-end justify-between">
            <div>
              <div className="section-tag mb-4">The 23 Difference</div>
              <h2 className="font-black text-white uppercase leading-[0.9] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
                What Makes<br />23 Different
              </h2>
            </div>
          </div>
          {/* 3 col grid with dividers */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-white/[0.06]">
            {[
              {
                title: "Built for You",
                subtitle: "Every piece is crafted around your identity. No two pieces alike.",
                svg: (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="svg-draw">
                    <path d="M40 60 L160 60 L160 140 L40 140 Z" fill="none" stroke="white" strokeWidth="1" />
                    <path d="M50 70 L170 70 L170 150 L50 150 Z" fill="none" stroke="white" strokeWidth="1" />
                    <path d="M60 80 L180 80 L180 160 L60 160 Z" fill="none" stroke="white" strokeWidth="1" />
                  </svg>
                )
              },
              {
                title: "Lagos Born",
                subtitle: "Designed from the streets of Lagos. Worn by those who define culture.",
                svg: (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="svg-draw">
                    <path d="M100 60 L140 80 L140 120 L100 140 L60 120 L60 80 Z" fill="none" stroke="white" strokeWidth="1" />
                    <path d="M100 60 L100 100 L140 120 M100 100 L60 120" fill="none" stroke="white" strokeWidth="1" />
                  </svg>
                )
              },
              {
                title: "Limited Always",
                subtitle: "Every drop is finite. Once it's gone, it's gone forever.",
                svg: (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="svg-draw">
                    <path d="M60 60 L140 60 L120 140 L40 140 Z" fill="none" stroke="white" strokeWidth="1" />
                    <path d="M80 70 L160 70 L140 150 L60 150 Z" fill="none" stroke="white" strokeWidth="1" />
                  </svg>
                )
              }
            ].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="px-8 py-12 flex flex-col gap-16 group"
              >
                {/* Fig label removed as per user request */}

                {/* SVG illustration — centered, 200x200, white strokes */}
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 12, y: -20 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    {card.svg}
                  </motion.div>
                </div>

                {/* Bottom text */}
                <div>
                  <h3 className="font-black text-white text-xl uppercase tracking-tight mb-3">{card.title}</h3>
                  <p className="text-white/40 font-light text-sm leading-relaxed">{card.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS — Light section, editorial product grid ── */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="section-tag text-[var(--accent)] mb-3">Just Dropped</div>
              <h2
                className="font-black text-black uppercase leading-[0.95] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
              >
                New<br />Arrivals
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.2em] uppercase text-black/50 hover:text-black transition-colors">
              View All <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BRAND STORY — THCO "Built on Talent" section adapted ── */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-[var(--accent)]/10 blur-[100px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-tag mb-6">Our Philosophy</div>
              <WordReveal
                text="Fashion Isn't What You Wear."
                className="font-black text-white uppercase leading-[0.95] tracking-[-0.02em] mb-8"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
              />
              <p className="text-white/50 leading-relaxed mb-6 font-light text-base">
                23 is luxury personalized for you. Born from the bold spirit of Lagos, we craft exclusive pieces where style meets identity. Every item carries a unique mark, making it truly yours.
              </p>
              <p className="text-white/30 leading-relaxed font-light text-sm mb-10">
                Because at 23, you don't just wear fashion. You own it.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 font-mono text-[0.62rem] tracking-[0.2em] uppercase text-white hover:bg-white hover:text-black transition-all duration-300 group"
              >
                Our Story <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden">
                <img src="/lookbook/6.jpg" alt="23 Brand" className="w-full h-full object-cover" />
              </div>
              {/* THCO floating label card */}
              <div className="absolute -bottom-6 -left-6 glass-dark rounded-xl p-5 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <span className="font-mono text-[0.58rem] text-[var(--accent)] uppercase tracking-wider font-medium">23 Identity</span>
                </div>
                <p className="font-semibold text-white text-sm leading-tight">Personalized Luxury</p>
                <p className="font-mono text-[0.55rem] text-white/30 mt-1">Each piece is yours alone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECOND MARQUEE — different color/direction ── */}
      <div className="bg-[#FAFAFA] border-y border-black/[0.06] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="marquee-track flex gap-12 items-center" style={{ animationDirection: 'reverse', animationDuration: '22s' }}>
            {['MADE TO ORDER', '— PREMIUM COTTON —', 'UNIQUE BARCODE', '— STYLE IS IDENTITY —',
              'LIMITED EDITION', '— STREET LUXURY —', 'MADE TO ORDER', '— PREMIUM COTTON —',
              'UNIQUE BARCODE', '— STYLE IS IDENTITY —', 'LIMITED EDITION', '— STREET LUXURY —'].map((item, i) => (
                <span key={i} className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-black/30 font-medium flex-shrink-0">
                  {item}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* ── CTA SECTION — THCO dark CTA card ── */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div
            className="rounded-[2rem] p-12 lg:p-20 relative overflow-hidden"
            style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-64 bg-[var(--accent)]/10 blur-[80px] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="text-center lg:text-left max-w-xl">
                <div className="section-tag justify-center lg:justify-start mb-5">Exclusive Access</div>
                <h2
                  className="font-black text-white uppercase leading-[0.95] tracking-[-0.02em] mb-5"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
                >
                  Join the<br />Movement
                </h2>
                <p className="text-white/40 leading-relaxed mb-8 font-light">
                  Be first to know about new drops, exclusive events, and behind-the-scenes content from 23.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const email = e.target.email.value;
                    if (email) {
                      window.open(`https://wa.me/2348107869063?text=I'd like to subscribe with my email: ${email}`, '_blank');
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0"
                >
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="YOUR EMAIL ADDRESS"
                    className="flex-1 bg-white/[0.05] border border-white/10 px-5 py-3.5 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-white placeholder-white/20 outline-none focus:border-[var(--accent)]/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[var(--accent)] text-black font-mono text-[0.6rem] tracking-[0.2em] uppercase font-bold hover:bg-white transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
              {/* Side stat */}
              <div className="flex-shrink-0 text-center">
                <p className="font-black text-white/10 text-[8rem] leading-none font-mono">23</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
