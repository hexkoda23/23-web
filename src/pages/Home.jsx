import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import Marquee from '../components/Marquee';

// Scroll-linked "scattered → gathered" card. Each card starts thrown across
// the section and glides into its grid slot as the user scrolls.
function ScatterCard({ progress, seed, className = '', children }) {
  const x = useTransform(progress, [0, 1], [seed.x, 0]);
  const y = useTransform(progress, [0, 1], [seed.y, 0]);
  const rotate = useTransform(progress, [0, 1], [seed.r, 0]);
  const opacity = useTransform(progress, [0, 0.3, 1], [0, 0.65, 1]);
  return (
    <motion.div style={{ x, y, rotate, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

// Decorative barcode used across the identity storytelling.
function BarcodeStripes({ className = '', bars = 24, color = 'currentColor' }) {
  const widths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3];
  return (
    <div className={`flex items-stretch gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} style={{ width: widths[i % widths.length], background: color }} className="block h-full" />
      ))}
    </div>
  );
}

// Data for home sections
const HERO_IMAGES = [
  '/lookbook/JF-11.JPG',
  '/lookbook/6.jpg',
  '/lookbook/18.jpg',
  '/lookbook/JF-22.JPG',
  '/lookbook/JF-1.JPG',
  '/lookbook/JF-4.JPG'
];

const HERO_DESKTOP_IMAGES = [
  { src: '/lookbook/JF-11.JPG', className: 'translate-y-10' },
  { src: '/lookbook/JF-1.JPG', className: '-translate-y-8' },
  { src: '/lookbook/JF-22.JPG', className: 'translate-y-14' },
];

const SOCIAL_IMAGES = [
  '/lookbook/1.jpg', '/lookbook/6.jpg', '/lookbook/3.jpg', '/lookbook/JF-22.JPG',
  '/lookbook/JF-15.JPG', '/lookbook/JF-8.JPG', '/lookbook/JF-1.JPG', '/lookbook/18.jpg'
];

export default function Home() {
  const [currentHero, setCurrentHero] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]); // Parallax 60% relative to wrapper

  // New Arrivals scatter → gather scroll choreography
  const arrivalsRef = useRef(null);
  const { scrollYProgress: arrivalsProgress } = useScroll({
    target: arrivalsRef,
    offset: ['start 0.95', 'start 0.35'],
  });
  const gather = useSpring(arrivalsProgress, { stiffness: 70, damping: 20, mass: 0.6 });

  useEffect(() => {
    // Mobile rotates every 3s; desktop keeps the slower gallery pace.
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % HERO_IMAGES.length);
    }, isMobile ? 3000 : 5200);
    return () => clearInterval(timer);
  }, []);

  // Diversify New Arrivals: Pick from different groups
  const newArrivals = [
    PRODUCTS.find(p => p.id === 'top-xxiii-black'), // 23x23
    PRODUCTS.find(p => p.id === 'top-35'),         // Faith or Fear
    PRODUCTS.find(p => p.id === 'bottom-12'),      // Blue Jean
    PRODUCTS.find(p => p.id === 'top-30'),         // Ascend Black
    PRODUCTS.find(p => p.id === 'bottom-10'),      // 23 X Denim Short
  ].filter(Boolean);

  // Diversify Unreleased: Unique items, no duplicates
  const unreleasedItems = [
    PRODUCTS.find(p => p.id === 'acc-5'),          // Cap
    PRODUCTS.find(p => p.id === 'top-29'),         // Motion Green (Replaced Cardigan)
    PRODUCTS.find(p => p.id === 'top-6'),          // Racing
    PRODUCTS.find(p => p.id === 'top-8'),          // Special Edition
  ].filter(Boolean);
  const bestsellers = PRODUCTS.filter(p => p.inStock).slice(2, 8);

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  // Word reveal text logic
  const text = "Clothes that move with you. Style that speaks before you do.";
  const words = text.split(" ");

  // Carousel drag logic
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    carouselRef.current.scrollLeft = scrollLeft - (x - startX) * 2;
  };
  const onMouseUp = () => setIsDragging(false);

  return (
    <div className="w-full bg-[var(--cream)] overflow-hidden">

      {/* 1. HERO SECTION (Version A -> NOW CINEMATIC CAROUSEL) */}
      <section className="relative h-screen w-full overflow-hidden bg-[var(--black)]" data-cursor="VIEW">
        <motion.div
          className="absolute inset-0 w-full h-[120%]"
          style={{ y: heroY }}
        >
          <div className="absolute inset-0 md:hidden">
            {HERO_IMAGES.map((img, idx) => (
              <motion.img
                key={idx}
                src={img}
                alt="23 Collection"
                className="absolute inset-0 w-full h-full object-cover object-top brightness-125"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{
                  opacity: currentHero === idx ? 1 : 0,
                  scale: currentHero === idx ? 1 : 1.1
                }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>

          <div className="absolute inset-0 hidden md:block">
            <motion.img
              src="/lookbook/18.jpg"
              alt="23 editorial atmosphere"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-95 brightness-125"
              initial={{ scale: 1.04 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="absolute inset-y-8 left-[58%] right-6 lg:right-10 flex items-center justify-end gap-4 lg:gap-5 pointer-events-none">
              {HERO_DESKTOP_IMAGES.map((item, idx) => {
                const isActive = currentHero % HERO_DESKTOP_IMAGES.length === idx;
                return (
                  <motion.div
                    key={item.src}
                    className={`relative h-[66vh] w-[12vw] min-w-[140px] max-w-[210px] overflow-hidden border border-white/15 bg-white/5 shadow-[0_32px_80px_rgba(0,0,0,0.34)] ${item.className}`}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{
                      opacity: isActive ? 1 : 0.62,
                      scale: isActive ? 1.02 : 0.97,
                    }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <img
                      src={item.src}
                      alt="23 lookbook editorial"
                      className="h-full w-full object-cover object-top brightness-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5" />
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.12)_38%,rgba(0,0,0,0)_66%,rgba(0,0,0,0.15)_100%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.2)_34%,rgba(0,0,0,0.02)_62%,rgba(0,0,0,0.2)_100%)] z-0" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/15 to-transparent z-0" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-32 px-6 lg:px-10 max-w-[1400px] mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative inline-block"
              onMouseEnter={() => setStoryOpen(true)}
              onMouseLeave={() => setStoryOpen(false)}
            >
              <h1
                className="font-display leading-[1.02] mb-5 max-w-[12ch] cursor-pointer"
                style={{ fontSize: 'clamp(3.2rem, 7vw, 6.8rem)', textShadow: '0 2px 40px rgba(0,0,0,0.4)' }}
                onClick={() => setStoryOpen(prev => !prev)}
                data-cursor-text="SCAN"
              >
                <span className="text-[var(--cream)]">Wear Your</span><br />
                <span
                  className="serif-italic"
                  style={{
                    background: 'linear-gradient(105deg, #F4F0E8 0%, #E9CF8B 35%, #B49A5E 62%, #E9CF8B 88%, #F4F0E8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  World
                </span>
              </h1>

              {/* The barcode identity story — revealed on hover / tap */}
              <AnimatePresence>
                {storyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 top-full z-30 w-[min(420px,84vw)] bg-black/85 backdrop-blur-xl border border-[#B49A5E]/40 p-6 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                  >
                    <BarcodeStripes className="h-6 mb-4 text-[var(--cream)]/80" bars={30} />
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#E9CF8B] mb-3">
                      What Wear Your World means
                    </p>
                    <p className="text-sm leading-relaxed text-white/80">
                      Every TWENTY3 piece is born with its own barcode — stitched into the garment
                      and bound to you. Load it with your name, your art, your socials, your story.
                      When a stranger scans it with any phone, they don't meet a label. They meet
                      <span className="serif-italic text-[#E9CF8B]"> you</span>.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                      One scan and your outfit has introduced you before you've said a word.
                      That is wearing your world — literally.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="font-mono text-[11px] tracking-[0.2em] font-medium uppercase text-white/80 mb-10 pl-1">
              New Collection · 2026
            </p>
            <div className="flex flex-wrap gap-3 pl-1">
              <Link
                to="/shop"
                className="wipe-btn border border-white text-white font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-8 md:px-10 py-5 transition-colors duration-300 hover:text-black hover:border-[var(--accent)]"
              >
                Shop Now
              </Link>
              <Link
                to="/ai-studio"
                className="wipe-btn bg-[var(--accent)] border border-[var(--accent)] text-black font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-8 md:px-10 py-5 transition-colors duration-300 hover:text-black hover:border-white"
              >
                Find Your 23 Fit
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 right-6 lg:right-10 flex flex-col items-center gap-3 z-10 mix-blend-difference opacity-70"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
          <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-[var(--accent)]" style={{ writingMode: 'vertical-rl' }}>
            Scroll
          </span>
        </motion.div>
      </section>

      {/* 2. NEW ARRIVALS — ASYMMETRIC MASONRY GRID */}
      <section className="py-24 lg:py-40 bg-[var(--cream)]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between border-b border-black/10 pb-6 mb-12">
            <h2
              className="font-display text-black leading-[1.02]"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
            >
              New<br /><span className="serif-italic">Arrivals</span>
            </h2>
            <Link to="/shop" className="nav-link font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-black hover:text-[var(--accent)] mb-2">
              View All →
            </Link>
          </div>

          {/* Scattered pieces gather into the grid as you scroll */}
          <div ref={arrivalsRef} className="grid grid-cols-2 md:grid-cols-3 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-16">
            {newArrivals[0] && (
              <ScatterCard progress={gather} seed={{ x: -160, y: 140, r: -8 }} className="col-span-1 md:col-span-2">
                <div className="aspect-[3/4] md:aspect-[4/5] w-full">
                  <ProductCard product={newArrivals[0]} />
                </div>
              </ScatterCard>
            )}
            {newArrivals[1] && (
              <ScatterCard progress={gather} seed={{ x: 180, y: -90, r: 9 }} className="col-span-1 md:col-span-1">
                <div className="aspect-[3/4] w-full mt-0 md:mt-[20%]">
                  <ProductCard product={newArrivals[1]} />
                </div>
              </ScatterCard>
            )}

            {newArrivals.slice(2, 5).map((product, i) => {
              const seeds = [
                { x: -130, y: -110, r: 6 },
                { x: 120, y: 150, r: -7 },
                { x: 200, y: 70, r: 11 },
              ];
              return (
                <ScatterCard key={product.id} progress={gather} seed={seeds[i % seeds.length]} className="col-span-1 md:col-span-1">
                  <div className="aspect-[3/4] w-full">
                    <ProductCard product={product} />
                  </div>
                </ScatterCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. EDITORIAL STORY SECTION */}
      <section className="relative overflow-hidden py-32 lg:py-48 min-h-[70vh] flex items-center">
        {/* Clean full bleed bg image - removed color multipliers */}
        <div className="absolute inset-0 z-0">
          <img src="/lookbook/18.jpg" alt="Editorial bg" className="w-full h-full object-cover object-center brightness-50" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10 flex flex-col items-center justify-center text-center">
          <div className="section-tag mb-10 text-white/70 border-white/20">Brand Philosophy</div>

          <h2 className="font-display text-white leading-[1.12] max-w-4xl flex flex-wrap justify-center gap-x-[0.25em] gap-y-2 mb-16" style={{ fontSize: 'clamp(2.1rem, 5vw, 4.6rem)' }}>
            {words.map((word, i) => (
              <span key={i} className="overflow-hidden inline-block">
                <motion.span
                  className="inline-block"
                  initial={{ y: '100%', opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h2>

          <Link
            to="/about"
            className="wipe-btn border border-white text-white font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-12 py-5 hover:border-[var(--accent)] hover:text-black"
          >
            Explore Our Vision
          </Link>
        </div>
      </section>

      {/* 5. UNRELEASED SECTION (Replaces Category Tiles) */}
      <section className="py-24 lg:py-40 bg-[var(--cream)]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between border-b border-black/10 pb-6 mb-12">
            <div>
              <div className="section-tag mb-2">Exclusive Look</div>
              <h2 className="font-display text-black leading-[1.02]" style={{ fontSize: 'clamp(2.6rem, 6vw, 4.6rem)' }}>
                Unreleased<br /><span className="serif-italic">Concepts</span>
              </h2>
            </div>
            <Link to="/shop?category=unreleased" className="nav-link font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-black hover:text-[var(--accent)] mb-2">
              View Collection →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8" style={{ perspective: '1200px' }}>
            {unreleasedItems.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 80, rotate: i % 2 === 0 ? -5 : 5, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                whileHover={{ y: -12 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="aspect-[3/4]">
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. THE COLLECTIONS — LUXURY SHOWCASE */}
      <section className="py-24 lg:py-40 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/9] overflow-hidden rounded-sm group/coll">
                <img
                  src="/lookbook/JF-6.JPG"
                  alt="Collections"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover/coll:scale-110"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="section-tag mb-6">Signature Series</div>
              <h2 className="font-display text-black leading-[1.05] mb-8" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)' }}>
                The <span className="serif-italic">Identity</span><br />Collection
              </h2>
              <p className="font-body text-black/60 text-lg leading-relaxed mb-10">
                Our core DNA. A selection of timeless pieces designed to be the foundation of your digital and physical presence. Minimalist in form, maximalist in intent.
              </p>
              <Link to="/shop?collection=identity" className="wipe-btn border border-black text-black font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-12 py-5">
                View Anthology
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MARQUEE STRIP — DUAL ROWS */}
      <section className="py-24 bg-[var(--black)] text-[var(--accent)] overflow-hidden flex flex-col gap-4 border-y border-white/10" data-cursor="DRAG">
        <Marquee
          text="TWENTY3 — Wear Your World — Authenticity — From Lagos to the World — "
          className="font-display text-[var(--cream)] text-5xl md:text-7xl lg:text-8xl"
          speed="45s"
        />
        <Marquee
          text="New Collection — Style is Identity — Street Luxury — From Lagos to the World — "
          className="serif-italic text-5xl md:text-7xl lg:text-8xl text-[var(--accent)] opacity-30"
          speed="60s"
          reverse={true}
        />
      </section>

      {/* 7. BESTSELLERS CAROUSEL */}
      <section className="py-24 lg:py-40 bg-white overflow-hidden relative group/section">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-end justify-between border-b border-black/10 pb-6 mb-12">
          <h2 className="font-display text-black leading-[1.02]" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)' }}>
            Trending<br /><span className="serif-italic">Now</span>
          </h2>
          {/* Arrow navigation handles for desktop hidden until hover */}
          <div className="hidden md:flex gap-2">
            <button className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors" onClick={() => carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' })}>←</button>
            <button className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors" onClick={() => carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' })}>→</button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-4 md:gap-6 px-6 lg:px-10 overflow-x-auto scrollbar-hide select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {bestsellers.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[45vw] md:w-[calc(100vw/3.5)] max-w-[400px] snap-start"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 100px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. IDENTITY FORGE — AI POWERED SECTION */}
      <section className="py-24 lg:py-40 bg-[var(--black)] relative overflow-hidden">
        {/* Abstract AI visuals (Subtle gradients) */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--accent)]/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <div className="section-tag dark mb-6 border-white/20 text-white/40">Next-Gen curation</div>
              <h2 className="font-display text-[var(--cream)] leading-[1.02] mb-8" style={{ fontSize: 'clamp(3rem, 6.5vw, 5.6rem)' }}>
                AI<br /><span className="serif-italic text-[var(--accent)]">Styling</span>
              </h2>
              <p className="font-body text-white/60 text-lg leading-relaxed mb-12 max-w-lg">
                Unlock the power of neural styling. Our AI engine analyzes your aesthetic and crafts custom outfit combinations that push the boundaries of your personal identity.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/ai-studio" className="wipe-btn bg-[var(--accent)] text-black border-[var(--accent)] font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-10 py-5 hover:bg-white hover:border-white">
                  Get Styled
                </Link>
                <Link to="/outfit-generator" className="wipe-btn border border-white/30 text-white font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-10 py-5 hover:border-white">
                  AI Outfit
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <motion.div
                className="relative aspect-square md:aspect-[4/3] rounded-sm overflow-hidden border border-white/10 group/forge"
                initial={{ clipPath: 'inset(12% 12% 12% 12%)', opacity: 0.4 }}
                whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <img src="/lookbook/JF-8.JPG" alt="AI Styling" className="w-full h-full object-cover transition-transform duration-1000 group-hover/forge:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Neural scan sweep */}
                <motion.div
                  className="absolute inset-x-0 h-[2px] bg-[var(--accent)]/80 shadow-[0_0_24px_rgba(241,236,225,0.8)]"
                  animate={{ top: ['4%', '96%', '4%'] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Visual data overlay for luxury feel */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="font-mono text-[8px] text-[var(--accent)] tracking-widest uppercase mb-1">Neural Analysis</div>
                      <div className="font-display text-white text-xl uppercase">STYLE_ENGINE_V2</div>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-ping" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. WHAT MAKES 23 DIFFERENT — REWRITTEN PER USER FEEDBACK */}
      <section className="py-24 lg:py-48 bg-[var(--cream)] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-24 relative">
          {/* Luxurious background accent text */}
          <div className="absolute top-0 right-0 hidden lg:block opacity-[0.04] serif-italic text-[11rem] leading-none -translate-y-1/2 select-none">
            Beyond
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-l border-black/10 pl-8 md:pl-12">
            <div className="max-w-2xl">
              <div className="section-tag mb-6 text-black/40 border-black/10">Brand DNA</div>
              <h2 className="font-display text-black leading-[1.05] mb-8" style={{ fontSize: 'clamp(2.7rem, 6vw, 5rem)' }}>
                What Makes<br />23 <span className="serif-italic" style={{ color: 'var(--gold)' }}>Different</span>
              </h2>
              <p className="font-body text-lg text-black/70 leading-relaxed mb-8 max-w-lg">
                Every TWENTY3 garment is stitched with its own barcode — a living code bound to
                the person wearing it. Scan any piece with a phone and the clothing introduces
                its owner: name, story, socials, world. Fashion that speaks before you do.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end flex-shrink-0">
              <BarcodeStripes className="h-10 mb-4 text-black/70" bars={28} />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50 mb-0 max-w-[280px] md:text-right leading-loose">
                Every piece carries a live code.<br />Scan it. Meet the wearer.
              </p>
            </div>
          </div>

          {/* MOVING BRAND PILLARS WITH EXACT FORMER ICONS */}
          {(() => {
            const BRAND_PILLARS = [
              {
                title: "Stitched Identity",
                subtitle: "Your barcode is woven into the garment itself. One code, one owner — no two pieces alike.",
                svg: (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-80">
                    <path d="M60 55 L85 45 L100 55 L115 45 L140 55 L150 80 L135 88 L135 155 L65 155 L65 88 L50 80 Z" fill="none" stroke="black" strokeWidth="2" />
                    {[82, 88, 93, 99, 104, 110, 115].map((x, i) => (
                      <rect key={x} x={x} y="105" width={i % 3 === 0 ? 4 : 2} height="34" fill="black" />
                    ))}
                  </svg>
                )
              },
              {
                title: "Scan to Meet Me",
                subtitle: "Any phone camera reads the code. Strangers don't see a label — they meet the real you.",
                svg: (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-80">
                    <rect x="72" y="42" width="56" height="116" rx="10" fill="none" stroke="black" strokeWidth="2" />
                    {[86, 92, 97, 103, 108, 114].map((x, i) => (
                      <rect key={x} x={x} y="78" width={i % 2 === 0 ? 3 : 2} height="28" fill="black" />
                    ))}
                    <line x1="60" y1="122" x2="140" y2="122" stroke="black" strokeWidth="2" strokeDasharray="5 4" />
                  </svg>
                )
              },
              {
                title: "You Own the Story",
                subtitle: "Update what your code says anytime — new socials, new work, new chapter. The cloth keeps up.",
                svg: (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-80">
                    <circle cx="100" cy="72" r="22" fill="none" stroke="black" strokeWidth="2" />
                    <path d="M60 150 Q100 108 140 150" fill="none" stroke="black" strokeWidth="2" />
                    <line x1="120" y1="60" x2="165" y2="60" stroke="black" strokeWidth="2" />
                    <line x1="126" y1="72" x2="165" y2="72" stroke="black" strokeWidth="2" />
                    <line x1="120" y1="84" x2="165" y2="84" stroke="black" strokeWidth="2" />
                  </svg>
                )
              }
            ];

            const PillarCard = ({ card, index }) => (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-[280px] md:w-auto px-8 py-16 flex flex-col gap-12 group hover:bg-white transition-colors duration-500 border-x border-transparent md:border-black/10 flex-shrink-0"
              >
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 12, y: -20 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    {card.svg}
                  </motion.div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="attention-product text-black text-2xl mb-3">{card.title}</h3>
                  <p className="font-mono text-black/50 text-[11px] leading-relaxed uppercase tracking-widest">{card.subtitle}</p>
                </div>
              </motion.div>
            );

            return (
              <>
                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-3 mt-20 border-y border-black/10">
                  {BRAND_PILLARS.map((card, index) => <PillarCard key={index} card={card} index={index} />)}
                </div>

                {/* Mobile Rotating Marquee */}
                <div className="block md:hidden mt-10 border-y border-black/10 overflow-hidden bg-black/5">
                  <Marquee speed="40s" pauseOnHover={true} className="flex">
                    {[...BRAND_PILLARS, ...BRAND_PILLARS].map((card, index) => (
                      <PillarCard key={'mob-' + index} card={card} index={0} />
                    ))}
                  </Marquee>
                </div>
              </>
            );
          })()}
        </div>

        {/* Infinite Scrolling Wall — Premium "Social Marquee" */}
        <div className="relative flex flex-col gap-6 scale-[1.02]">
          <Marquee speed="60s" pauseOnHover={true} className="flex gap-4">
            {SOCIAL_IMAGES.slice(0, 4).map((src, i) => (
              <div key={i} className="w-[300px] md:w-[450px] aspect-[4/5] overflow-hidden rounded-sm group/social relative cursor-pointer">
                <img src={src} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-out scale-100 group-hover/social:scale-105" alt="Social feature" />
                <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover/social:opacity-100 transition-opacity duration-500 translate-y-2 group-hover/social:translate-y-0 text-white font-mono text-[9px] uppercase tracking-widest bg-black/80 px-3 py-2 backdrop-blur-sm">
                  Tagged @SHOP23
                </div>
              </div>
            ))}
          </Marquee>

          <Marquee speed="80s" reverse={true} pauseOnHover={true} className="flex gap-4">
            {SOCIAL_IMAGES.slice(4, 8).map((src, i) => (
              <div key={i} className="w-[300px] md:w-[450px] aspect-[4/5] overflow-hidden rounded-sm group/social relative cursor-pointer">
                <img src={src} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-out scale-100 group-hover/social:scale-105" alt="Social feature" />
                <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover/social:opacity-100 transition-opacity duration-500 translate-y-2 group-hover/social:translate-y-0 text-white font-mono text-[9px] uppercase tracking-widest bg-black/80 px-3 py-2 backdrop-blur-sm">
                  Tagged @SHOP23
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* 9. EXCLUSIVE ACCESS — NEWSLETTER SECTION */}
      <section className="py-24 lg:py-40 bg-[var(--black)] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="section-tag dark mb-8">Newsletter</div>
            <h2 className="font-display text-[var(--cream)] leading-[1.05] mb-6" style={{ fontSize: 'clamp(2.8rem, 7.5vw, 6.5rem)' }}>
              Exclusive <span className="serif-italic">Access</span>
            </h2>
            <p className="font-mono text-[11px] tracking-[0.2em] font-medium uppercase text-white/50 mb-12">
              Join the movement and be the first to know about upcoming drops.
            </p>

            <form className="w-full max-w-lg mx-auto flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                className="flex-grow bg-transparent border-b border-white/20 px-4 py-4 font-mono text-xs text-white focus:outline-none focus:border-[var(--accent)] transition-colors"
                required
              />
              <button
                type="submit"
                className="wipe-btn border border-white text-white font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-10 py-4 hover:border-[var(--accent)] hover:text-black"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>

        {/* Deep background graphic */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display attention-heading text-[30vw] text-white/10 select-none">
            23
          </div>
        </div>
      </section>

      {/* 10. STATS STRIP (Existing, tweaked visually) */}
      <section ref={statsRef} className="py-24 bg-[var(--black)]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-x divide-white/10">
          {[{ v: 23, s: '', l: 'Identity' }, { v: 100, s: '%', l: 'Authentic' }, { v: 50, s: '+', l: 'Styles' }, { v: 3, s: 'yrs', l: 'Legacy' }].map((stat, i) => (
            <motion.div
              key={i}
              className={`flex flex-col items-center text-center ${i > 0 && i % 2 !== 0 ? 'border-l border-white/10' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="font-display attention-heading text-[var(--accent)] leading-[0.9] mb-2" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
                {stat.v}{stat.s}
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-white/50">{stat.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
