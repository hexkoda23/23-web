import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState, useMemo, useRef } from 'react';

export default function ProductCard({ product }) {
  const images = useMemo(() => {
    const arr = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];
    return arr.filter(Boolean);
  }, [product.images, product.image]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!playing || images.length <= 1) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, 1000);
    return () => clearInterval(id);
  }, [playing, images.length]);

  const start = () => {
    if (images.length > 1) setPlaying(true);
  };
  const stop = () => {
    setPlaying(false);
    setIndex(0);
  };
  const touchStart = () => {
    if (images.length <= 1) return;
    setPlaying(true);
    setTimeout(() => {
      stop();
    }, 2500);
  };

  useEffect(() => {
    const isTouch = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches;
    if (!isTouch) return;
    if (!cardRef.current) return;
    if (images.length <= 1) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPlaying(true);
          } else {
            setPlaying(false);
            setIndex(0);
          }
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [images.length]);

  return (
    <Link to={`/product/${product.id}`} className="group block">
      {/* Image container */}
      <div
        className="relative overflow-hidden bg-[#F5F5F5] mb-4"
        style={{ aspectRatio: '3/4' }}
        onMouseEnter={start}
        onMouseLeave={stop}
        onTouchStart={touchStart}
        onTouchEnd={stop}
        ref={cardRef}
      >
        <motion.img
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          src={images[index]}
          alt={product.name}
          className="w-full h-full object-contain object-center"
        />
        {/* Status badge — THCO style */}
        {product.category === 'unreleased' && (
          <div className="absolute top-3 left-3 bg-black text-white font-mono text-[0.55rem] tracking-[0.18em] uppercase px-2.5 py-1.5">
            Unreleased
          </div>
        )}
        {product.comingSoon && (
          <div className="absolute top-3 left-3 bg-[var(--accent)] text-black font-mono text-[0.55rem] tracking-[0.18em] uppercase px-2.5 py-1.5 font-bold">
            Coming Soon
          </div>
        )}
        {!product.inStock && !product.comingSoon && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-black font-mono text-[0.55rem] tracking-[0.18em] uppercase px-2.5 py-1.5">
            Sold Out
          </div>
        )}
        {/* Quick view on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/90 backdrop-blur-sm py-3 text-center">
          <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-white">
            {product.category === 'unreleased' ? 'Contact to Order' : 'Quick View'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-mono text-[0.7rem] tracking-[0.12em] uppercase text-black group-hover:text-black/60 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 font-mono text-[0.58rem] tracking-[0.1em] uppercase text-black/30">
            {product.category}
          </p>
          {(product.comingSoon && product.preorderAvailable) && (
            <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--accent)]">Pre-Order</p>
          )}
        </div>
        <p className="font-mono text-[0.7rem] text-black font-medium whitespace-nowrap">
          {product.category === 'unreleased' ? '—' : `₦${Number(product.price).toLocaleString('en-NG')}`}
        </p>
      </div>
    </Link>
  );
}
