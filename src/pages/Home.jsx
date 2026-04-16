import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import Marquee from '../components/Marquee';
import { MapPin, Cpu, Truck, Layers } from 'lucide-react';

// Data for home sections
const HERO_IMAGES = [
  '/lookbook/JF-11.JPG',
  '/lookbook/6.jpg',
  '/lookbook/18.jpg',
  '/lookbook/JF-22.JPG',
  '/lookbook/JF-1.JPG',
  '/lookbook/JF-15.JPG'
];

const SOCIAL_IMAGES = [
  '/lookbook/1.jpg', '/lookbook/6.jpg', '/lookbook/3.jpg', '/lookbook/JF-22.JPG',
  '/lookbook/JF-15.JPG', '/lookbook/JF-8.JPG', '/lookbook/JF-1.JPG', '/lookbook/18.jpg'
];

export default function Home() {
  const [currentHero, setCurrentHero] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]); // Parallax 60% relative to wrapper

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 2500); // 2 seconds + crossfade time
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
          {HERO_IMAGES.map((img, idx) => (
            <motion.img
              key={idx}
              src={img}
              alt="23 Collection"
              className="absolute inset-0 w-full h-full object-cover object-top"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{
                opacity: currentHero === idx ? 0.7 : 0,
                scale: currentHero === idx ? 1 : 1.1
              }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 z-0" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-32 px-6 lg:px-10 max-w-[1400px] mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              className="font-display font-black text-white uppercase leading-[0.85] tracking-[-0.04em] mix-blend-difference mb-4"
              style={{ fontSize: 'clamp(4.5rem, 12vw, 9.5rem)' }}
            >
              WEAR YOUR<br />WORLD
            </h1>
            <p className="font-mono text-[11px] tracking-[0.2em] font-medium uppercase text-white/80 mb-10 pl-1">
              New Collection · 2026
            </p>
            <div className="flex pl-1">
              <Link
                to="/shop"
                className="wipe-btn border border-white text-white font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-10 py-5 transition-colors duration-300 hover:text-black hover:border-[var(--accent)]"
              >
                Shop Now
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
              className="font-display font-black text-black uppercase tracking-[-0.03em] leading-none"
              style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
            >
              New<br />Arrivals
            </h2>
            <Link to="/shop" className="nav-link font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-black hover:text-[var(--accent)] mb-2">
              View All →
            </Link>
          </div>

          {/* Desktop Asymmetric Grid, Mobile Single Col */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12 md:gap-y-16">
            {/* Row 1: Large (Span 2) + Small (Span 1) */}
            {newArrivals[0] && (
              <motion.div
                className="md:col-span-2"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="aspect-[4/5] w-full">
                  <ProductCard product={newArrivals[0]} />
                </div>
              </motion.div>
            )}
            {newArrivals[1] && (
              <motion.div
                className="md:col-span-1"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="aspect-[3/4] w-full mt-0 md:mt-[20%]">
                  <ProductCard product={newArrivals[1]} />
                </div>
              </motion.div>
            )}

            {/* Row 2: 3 Equal width items */}
            {newArrivals.slice(2, 5).map((product, i) => (
              <motion.div
                key={product.id}
                className="md:col-span-1"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="aspect-[3/4] w-full">
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
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

          <h2 className="font-display font-bold text-white leading-[1.05] max-w-4xl tracking-[-0.02em] flex flex-wrap justify-center gap-x-[0.25em] gap-y-1 mb-16" style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}>
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
              <h2 className="font-display font-black text-black uppercase tracking-[-0.03em] leading-none" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
                Unreleased<br />Concepts
              </h2>
            </div>
            <Link to="/shop?category=unreleased" className="nav-link font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-black hover:text-[var(--accent)] mb-2">
              View Collection →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {unreleasedItems.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
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
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                >
                  <h3 className="font-display font-black text-white text-[8vw] uppercase tracking-tighter mix-blend-overlay">XXIII</h3>
                </motion.div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="section-tag mb-6">Signature Series</div>
              <h2 className="font-display font-black text-black uppercase tracking-[-0.03em] leading-[0.9] mb-8" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
                THE<br />IDENTITY<br />COLLECTION
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
          text="23 ✦ WEAR YOUR WORLD ✦ AUTHENTICITY ✦ FROM LAGOS TO THE WORLD ✦ "
          className="font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-[-0.03em] uppercase"
          speed="35s"
        />
        <Marquee
          text="NEW COLLECTION ✦ STYLE IS IDENTITY ✦ STREET LUXURY ✦ FROM LAGOS TO THE WORLD ✦ "
          className="font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-[-0.03em] uppercase text-[var(--accent)] opacity-40 mix-blend-screen"
          speed="45s"
          reverse={true}
        />
      </section>

      {/* 7. BESTSELLERS CAROUSEL */}
      <section className="py-24 lg:py-40 bg-white overflow-hidden relative group/section">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-end justify-between border-b border-black/10 pb-6 mb-12">
          <h2 className="font-display font-black text-black uppercase tracking-[-0.03em] leading-none" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
            Trending<br />Now
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
              className="flex-shrink-0 w-[70vw] md:w-[calc(100vw/3.5)] max-w-[400px] snap-start"
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
              <h2 className="font-display font-black text-white uppercase tracking-[-0.04em] leading-[0.85] mb-8" style={{ fontSize: 'clamp(3.5rem, 8vw, 6.5rem)' }}>
                AI<br /><span className="text-[var(--accent)]">STYLING</span>
              </h2>
              <p className="font-body text-white/60 text-lg leading-relaxed mb-12 max-w-lg">
                Unlock the power of neural styling. Our AI engine analyzes your aesthetic and crafts custom outfit combinations that push the boundaries of your personal identity.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/identity-forge" className="wipe-btn bg-[var(--accent)] text-black border-[var(--accent)] font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-10 py-5 hover:bg-white hover:border-white">
                  Get Styled
                </Link>
                <Link to="/outfit-generator" className="wipe-btn border border-white/30 text-white font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-10 py-5 hover:border-white">
                  AI Outfit
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <div className="relative aspect-square md:aspect-[4/3] rounded-sm overflow-hidden border border-white/10 group/forge">
                <img src="/lookbook/JF-8.JPG" alt="AI Styling" className="w-full h-full object-cover transition-transform duration-1000 group-hover/forge:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. WHAT MAKES 23 DIFFERENT — REWRITTEN PER USER FEEDBACK */}
      <section className="py-24 lg:py-48 bg-[var(--cream)] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-24 relative">
          {/* Luxurious background accent text */}
          <div className="absolute top-0 right-0 hidden lg:block opacity-[0.03] font-display font-black text-[12rem] leading-none -translate-y-1/2">
            BEYOND
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-l border-black/10 pl-8 md:pl-12">
            <div className="max-w-2xl">
              <div className="section-tag mb-6 text-black/40 border-black/10">Brand DNA</div>
              <h2 className="font-display font-black text-black uppercase tracking-[-0.04em] leading-[0.85] mb-8" style={{ fontSize: 'clamp(3.5rem, 8vw, 6.5rem)' }}>
                WHAT MAKES<br />23 DIFFERENT
              </h2>
              <p className="font-body text-lg text-black/70 leading-relaxed mb-8 max-w-lg">
                Crafted in Lagos, built for the world. We combine local artistry with neural technology to create a wardrobe that moves as fast as you do.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end flex-shrink-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50 mb-0 max-w-[280px] md:text-right leading-loose">
                Established in Lagos. <br /> Built for your digital identity.
              </p>
            </div>
          </div>

          {/* MOVING BRAND PILLARS WITH EXACT FORMER ICONS */}
          {(() => {
            const BRAND_PILLARS = [
              {
                title: "Built for You",
                subtitle: "Every piece is crafted around your identity. No two pieces alike.",
                svg: (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-80">
                    <path d="M40 60 L160 60 L160 140 L40 140 Z" fill="none" stroke="black" strokeWidth="2" />
                    <path d="M50 70 L170 70 L170 150 L50 150 Z" fill="none" stroke="black" strokeWidth="2" />
                    <path d="M60 80 L180 80 L180 160 L60 160 Z" fill="none" stroke="black" strokeWidth="2" />
                  </svg>
                )
              },
              {
                title: "Lagos Born",
                subtitle: "Designed from the streets of Lagos. Worn by those who define culture.",
                svg: (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-80">
                    <path d="M100 60 L140 80 L140 120 L100 140 L60 120 L60 80 Z" fill="none" stroke="black" strokeWidth="2" />
                    <path d="M100 60 L100 100 L140 120 M100 100 L60 120" fill="none" stroke="black" strokeWidth="2" />
                  </svg>
                )
              },
              {
                title: "Limited Always",
                subtitle: "Every drop is finite. Once it's gone, it's gone forever.",
                svg: (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-80">
                    <path d="M60 60 L140 60 L120 140 L40 140 Z" fill="none" stroke="black" strokeWidth="2" />
                    <path d="M80 70 L160 70 L140 150 L60 150 Z" fill="none" stroke="black" strokeWidth="2" />
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
                  <h3 className="font-display font-black text-black text-2xl uppercase tracking-tight mb-3">{card.title}</h3>
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
            <h2 className="font-display font-black text-white uppercase tracking-[-0.04em] leading-none mb-6" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}>
              EXCLUSIVE ACCESS
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-black text-[30vw] text-white/10 select-none">
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
              <div className="font-display font-black text-[var(--accent)] leading-none mb-2" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
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
