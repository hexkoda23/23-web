import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ArrowRight, Grid, LayoutGrid, Film, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const NEW_JF_NUMS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27
];
const NEW_IMAGES = NEW_JF_NUMS.map(n => `/lookbook/JF-${n}.JPG`);
const OLD_IMAGES = Array.from({ length: 20 }, (_, i) => `/lookbook/${i + 1}.jpg`);
const IMAGES = [...NEW_IMAGES, ...OLD_IMAGES];

const FILTERS = ['All', 'Collection JF', 'Archive', 'Portraits', 'Details'];

const CURATED = [
  { src: '/lookbook/JF-1.JPG', title: 'The Statement', desc: 'For those who enter a room and own it.', tag: 'Hero Piece' },
  { src: '/lookbook/JF-8.JPG', title: 'Street Sovereign', desc: 'Lagos energy, global aesthetic.', tag: 'Street Edit' },
  { src: '/lookbook/JF-15.JPG', title: 'The Quiet Luxury', desc: 'Understated. Unmistakable.', tag: 'Signature' },
];

function LookbookHero() {
  return (
    <section className="relative h-screen bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden">

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Gold glow orb behind text */}
      <div className="absolute w-[600px] h-[300px] bg-[var(--accent)]/5 blur-[120px] rounded-full" />

      {/* LOOKBOOK title — splits open */}
      <div className="relative z-10 text-center overflow-hidden">
        {/* Top half */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-black text-white uppercase leading-none tracking-[-0.04em]"
            style={{ fontSize: 'clamp(5rem, 18vw, 18rem)' }}
          >
            LOOK
          </motion.h1>
        </div>
        {/* Bottom half */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="font-black uppercase leading-none tracking-[-0.04em]"
            style={{
              fontSize: 'clamp(5rem, 18vw, 18rem)',
              background: 'linear-gradient(135deg, #C8A96E 0%, #F5DFA0 50%, #C8A96E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BOOK
          </motion.h1>
        </div>
      </div>

      {/* Year label */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="font-mono text-[0.65rem] tracking-[0.3em] text-white/30 uppercase mt-6 z-10"
      >
        Visual Archive — 2025 · 2026
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="font-mono text-[0.55rem] tracking-[0.25em] text-white/20 uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  );
}

function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = 'unset';
    }
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white/60 hover:text-white z-10 transition-colors">
        <X size={18} />
      </button>

      {/* Counter */}
      <div className="absolute top-6 left-6 font-mono text-[0.6rem] tracking-[0.2em] text-white/30 uppercase z-10">
        {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </div>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-h-[85vh] max-w-[85vw] object-contain select-none"
          onClick={e => e.stopPropagation()}
        />
      </AnimatePresence>

      {/* Prev / Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 glass-dark rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 glass-dark rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </motion.div>
  );
}

export default function Lookbook() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('Grid'); // Grid, Masonry, Cinema, Slideshow
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [cinemaIndex, setCinemaIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter logic
  const filteredImages = IMAGES.filter((img, idx) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Collection JF') return img.includes('JF-');
    if (activeFilter === 'Archive') return !img.includes('JF-');
    if (activeFilter === 'Portraits') return idx % 3 === 0;
    if (activeFilter === 'Details') return idx % 5 === 0;
    return true;
  });

  // Cinema nav
  const nextCinema = () => {
    setDirection(1);
    setCinemaIndex(prev => (prev + 1) % filteredImages.length);
  };
  const prevCinema = () => {
    setDirection(-1);
    setCinemaIndex(prev => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  // Slideshow auto-play
  useEffect(() => {
    if (viewMode !== 'Slideshow' || isPaused) return;
    const interval = setInterval(nextCinema, 3000);
    return () => clearInterval(interval);
  }, [viewMode, isPaused]);

  // Swipe support for cinema mode
  const touchStart = useRef(0);
  const handleTouchStart = (e) => (touchStart.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    if (diff > 50) nextCinema();
    if (diff < -50) prevCinema();
  };

  return (
    <PageTransition>
      <div className="w-full bg-[#0A0A0A] min-h-screen">
        <LookbookHero />

        {/* SECTION 2: Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="sticky top-[72px] z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.06] py-4"
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`flex-shrink-0 px-4 py-1.5 font-mono text-[0.6rem] tracking-[0.15em] uppercase transition-all duration-200 rounded-full border ${activeFilter === f
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-black'
                      : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-6">
              <div className="flex gap-1 bg-white/5 p-1 rounded-full">
                {[
                  { name: 'Grid', icon: <Grid size={14} /> },
                  { name: 'Masonry', icon: <LayoutGrid size={14} /> },
                  { name: 'Cinema', icon: <Film size={14} /> },
                  { name: 'Slideshow', icon: <Play size={14} /> }
                ].map(mode => (
                  <button
                    key={mode.name}
                    onClick={() => setViewMode(mode.name)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${viewMode === mode.name ? 'bg-[var(--accent)] text-black' : 'text-white/40 hover:text-white'
                      }`}
                    title={mode.name}
                  >
                    {mode.icon}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[0.58rem] text-white/20 tracking-[0.15em] hidden lg:block">
                {filteredImages.length} looks
              </span>
            </div>
          </div>
        </motion.div>

        {/* SECTION 3: Main Gallery */}
        <section className="py-12 px-6 lg:px-10 max-w-[1400px] mx-auto min-h-[60vh]">
          <AnimatePresence mode="wait">

            {/* Mode A — GRID */}
            {viewMode === 'Grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {filteredImages.map((src, i) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 8) * 0.05 }}
                    className="editorial-card aspect-[4/5] group overflow-hidden"
                    onClick={() => setLightboxIndex(IMAGES.indexOf(src))}
                  >
                    <img src={src} className="w-full h-full object-cover" loading="lazy" />
                    <div className="overlay" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 glass-dark rounded-full flex items-center justify-center text-white">
                        +
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 font-mono text-[0.55rem] text-white/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      Look {String(IMAGES.indexOf(src) + 1).padStart(2, '0')}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Mode B — MASONRY */}
            {viewMode === 'Masonry' && (
              <motion.div
                key="masonry"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
              >
                {filteredImages.map((src, i) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="editorial-card break-inside-avoid group border border-transparent hover:border-[var(--accent)]/30 transition-colors"
                    onClick={() => setLightboxIndex(IMAGES.indexOf(src))}
                  >
                    <img src={src} className="w-full h-auto" loading="lazy" />
                    <div className="overlay" />
                    <div className="absolute bottom-4 left-4 font-mono text-[0.55rem] text-white/60 uppercase tracking-widest">
                      Look {String(IMAGES.indexOf(src) + 1).padStart(2, '0')}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Mode C — CINEMA */}
            {viewMode === 'Cinema' && (
              <motion.div
                key="cinema"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 lg:py-16 min-h-[70vh]"
              >
                <p className="font-mono text-[0.6rem] tracking-[0.2em] text-white/30 mb-8 uppercase">
                  {String(cinemaIndex + 1).padStart(2, '0')} / {String(filteredImages.length).padStart(2, '0')}
                </p>

                <div
                  className="relative w-full max-w-[800px] px-4"
                  style={{ aspectRatio: '4/5' }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={cinemaIndex}
                      src={filteredImages[cinemaIndex]}
                      initial={{ opacity: 0, x: direction * 60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -60 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover cursor-pointer shadow-2xl"
                      onClick={() => setLightboxIndex(IMAGES.indexOf(filteredImages[cinemaIndex]))}
                    />
                  </AnimatePresence>

                  <button onClick={prevCinema} className="absolute left -6 lg:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 glass-dark rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ChevronLeft size={20} className="text-white/60" />
                  </button>
                  <button onClick={nextCinema} className="absolute right-4 lg:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 glass-dark rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ChevronRight size={20} className="text-white/60" />
                  </button>
                </div>

                <div className="flex gap-2 mt-12 px-6 overflow-x-auto scrollbar-hide max-w-full pb-4">
                  {filteredImages.map((src, i) => {
                    const isAround = Math.abs(i - cinemaIndex) <= 2;
                    if (!isAround) return null;
                    return (
                      <button
                        key={src}
                        onClick={() => { setDirection(i > cinemaIndex ? 1 : -1); setCinemaIndex(i); }}
                        className={`w-14 h-20 flex-shrink-0 overflow-hidden transition-all duration-300 ${i === cinemaIndex ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[#0A0A0A] opacity-100' : 'opacity-30 hover:opacity-60'}`}
                      >
                        <img src={src} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Mode D — SLIDESHOW */}
            {viewMode === 'Slideshow' && (
              <motion.div
                key="slideshow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center"
              >
                <div className="absolute top-24 left-10 z-10 font-mono text-[0.6rem] tracking-[0.2em] text-white/30 uppercase">
                  Look {String(IMAGES.indexOf(filteredImages[cinemaIndex]) + 1).padStart(2, '0')}
                </div>
                <div className="absolute top-24 right-10 z-10 flex gap-4">
                  <button onClick={() => setIsPaused(!isPaused)} className="text-white/40 hover:text-white transition-colors">
                    {isPaused ? <Play size={18} /> : <Pause size={18} />}
                  </button>
                  <button onClick={() => setViewMode('Grid')} className="text-white/40 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={cinemaIndex}
                    src={filteredImages[cinemaIndex]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="max-h-screen max-w-screen object-contain"
                  />
                </AnimatePresence>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
                  <motion.div
                    key={`${cinemaIndex}-${isPaused}`}
                    className="h-full bg-[var(--accent)]"
                    initial={{ scaleX: 0 }}
                    animate={isPaused ? { scaleX: 0 } : { scaleX: 1 }}
                    transition={isPaused ? { duration: 0 } : { duration: 3, ease: 'linear' }}
                    style={{ transformOrigin: 'left' }}
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>

        {/* SECTION 4: Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <Lightbox
              images={IMAGES}
              currentIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNext={() => setLightboxIndex(prev => (prev + 1) % IMAGES.length)}
              onPrev={() => setLightboxIndex(prev => (prev - 1 + IMAGES.length) % IMAGES.length)}
            />
          )}
        </AnimatePresence>

        {/* SECTION 5: "The 23 Edit" */}
        <section className="py-24 bg-[#0A0A0A] border-t border-white/[0.06]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="mb-14">
              <div className="section-tag mb-4">Editor's Pick</div>
              <h2 className="font-black text-white uppercase" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
                The 23 Edit
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CURATED.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="editorial-card group aspect-[3/4] cursor-pointer"
                  onClick={() => setLightboxIndex(IMAGES.indexOf(item.src))}
                >
                  <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                  <div className="overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="font-mono text-[0.58rem] tracking-[0.2em] text-[var(--accent)] uppercase mb-2 block">{item.tag}</span>
                    <h3 className="font-black text-white text-2xl uppercase tracking-tight mb-2 relative">
                      {item.title}
                      <span className="absolute -bottom-1 left-0 h-[1px] bg-[var(--accent)] w-0 group-hover:w-full transition-all duration-500" />
                    </h3>
                    <p className="text-white/50 text-sm font-light">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: Lookbook CTA */}
        <section className="py-24 bg-[#111111] text-center border-t border-white/[0.06]">
          <div className="max-w-[600px] mx-auto px-6">
            <div className="section-tag justify-center mb-6">Ready to Wear</div>
            <h2 className="font-black text-white uppercase leading-[0.9] tracking-[-0.02em] mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
              Own the Look
            </h2>
            <p className="text-white/40 font-light mb-10 leading-relaxed">
              Every look you've seen is available. Limited quantities. Shop before it's gone.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--accent)] text-black font-mono text-[0.65rem] tracking-[0.25em] uppercase font-bold hover:bg-white transition-all duration-300 group"
            >
              Shop the Collection
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
