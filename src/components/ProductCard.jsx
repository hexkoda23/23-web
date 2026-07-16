import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { getDefaultSize, inferColorTags, inferFunctionalCategory } from '../lib/styleEngine';

// Deep editorial tones per colour family — the product's text rhymes with
// the garment itself while staying readable on white.
const COLOR_TONES = {
  black: { text: '#111111', swatch: '#111111', label: 'Noir' },
  white: { text: '#7d786e', swatch: '#e8e4da', label: 'White' },
  cream: { text: '#96814f', swatch: '#e2d5b8', label: 'Cream' },
  green: { text: '#2f5d3a', swatch: '#2f5d3a', label: 'Green' },
  blue: { text: '#2b4a7f', swatch: '#2b4a7f', label: 'Blue' },
  pink: { text: '#b45a77', swatch: '#e4a5b8', label: 'Pink' },
  orange: { text: '#b45f2d', swatch: '#d97b3f', label: 'Orange' },
  yellow: { text: '#a8842c', swatch: '#e3b93e', label: 'Yellow' },
  red: { text: '#8f2d2d', swatch: '#a83232', label: 'Red' },
  brown: { text: '#6b4a2f', swatch: '#7d5537', label: 'Brown' },
  denim: { text: '#33506b', swatch: '#3f5d7d', label: 'Denim' },
  grey: { text: '#5f5f5f', swatch: '#8a8a8a', label: 'Grey' },
  neutral: { text: '#3a372f', swatch: '#8a857c', label: 'Signature' },
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const tone = useMemo(() => {
    const colors = inferColorTags(product);
    return COLOR_TONES[colors[0]] || COLOR_TONES.neutral;
  }, [product]);
  const categoryLabel = useMemo(() => inferFunctionalCategory(product).replace('fullFit', 'full set'), [product]);
  // All images available for this product
  const allImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image];

  const image1 = allImages[0];
  const image2 = allImages.length > 1 ? allImages[1] : image1;

  // Mobile carousel state
  const [mobileIndex, setMobileIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef(null);

  const formattedPrice = `₦${Number(product.price).toLocaleString('en-NG')}`;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-cycle images on mobile if there are multiple
  useEffect(() => {
    if (isMobile && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setMobileIndex(prev => (prev + 1) % allImages.length);
      }, 1800);
    }
    return () => clearInterval(intervalRef.current);
  }, [isMobile, allImages.length]);

  // Reset index when product changes
  useEffect(() => {
    setMobileIndex(0);
  }, [product.id]);

  return (
    <Link to={`/product/${product.id}`} className="group block product-card" data-cursor="VIEW">
      <div className="relative aspect-[3/4] bg-white overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          {product.category === 'unreleased' ? (
            <span className="bg-black text-[var(--accent)] font-mono text-[10px] tracking-widest uppercase px-2 py-1 leading-none">
              Unreleased
            </span>
          ) : product.isNew ? (
            <span className="bg-[var(--accent)] text-black font-mono text-[10px] tracking-widest uppercase px-2 py-1 leading-none font-bold">
              New
            </span>
          ) : null}
          {!product.inStock && !product.comingSoon && (
            <span className="bg-[#444] text-white font-mono text-[10px] tracking-widest uppercase px-2 py-1 leading-none">
              Sold Out
            </span>
          )}
        </div>

        {/* Mobile: image dots indicator */}
        {isMobile && allImages.length > 1 && (
          <div className="absolute bottom-[98px] left-0 right-0 z-30 flex justify-center gap-1.5 pointer-events-none">
            {allImages.map((_, idx) => (
              <span
                key={idx}
                className={`block rounded-full transition-all duration-300 ${
                  idx === mobileIndex
                    ? 'w-4 h-1.5 bg-black'
                    : 'w-1.5 h-1.5 bg-black/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* MOBILE: animated image carousel */}
        {isMobile ? (
          <div className="w-full h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={mobileIndex}
                src={allImages[mobileIndex]}
                alt={`${product.name} view ${mobileIndex + 1}`}
                className="absolute inset-0 w-full h-full object-contain bg-white"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              />
            </AnimatePresence>
          </div>
        ) : (
          /* DESKTOP: hover swap */
          <div className="w-full h-full relative overflow-hidden">
            <motion.img
              src={image1}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-contain bg-white transition-opacity duration-350 ease-in-out group-hover:opacity-0"
              transition={{ duration: 0.4 }}
            />
            <motion.img
              src={image2}
              alt={`${product.name} alternate`}
              className="absolute inset-0 w-full h-full object-contain bg-white opacity-0 transition-opacity duration-350 ease-in-out group-hover:opacity-100"
              transition={{ duration: 0.4 }}
            />
          </div>
        )}

        {/* Slide Up Drawer */}
        <div className="absolute bottom-0 left-0 right-0 h-[90px] bg-white translate-y-full transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 p-4 flex flex-col justify-between border-t border-black/5 z-20">
          <div className="flex justify-between items-start gap-4">
            <h3 className="attention-product text-base line-clamp-1 flex-1" style={{ color: tone.text }}>
              {product.name}
            </h3>
            <span className="font-mono text-[11px] font-medium" style={{ color: tone.text }}>
              {formattedPrice}
            </span>
          </div>

          <button
            className="w-full py-2 bg-[var(--cream)] hover:bg-[var(--accent)] text-black font-mono text-[10px] uppercase tracking-[0.2em] font-bold transition-colors active:scale-[0.98] mt-1 disabled:opacity-40 disabled:pointer-events-none"
            disabled={!product.inStock && product.category !== 'unreleased'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, getDefaultSize(product), 1);
            }}
          >
            {(!product.inStock && product.category !== 'unreleased') ? 'Sold Out' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Default text underneath product — toned to the garment's colour */}
      <div className="mt-3 flex justify-between items-start group-hover:-translate-y-2 group-hover:opacity-0 transition-all duration-300">
        <div>
          <h3 className="attention-product text-[15px] max-w-[22ch]" style={{ color: tone.text }}>
            {product.name}
          </h3>
          <p className="mt-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#8a857c]">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0"
              style={{ background: tone.swatch }}
            />
            {tone.label} · {categoryLabel}
          </p>
        </div>
        <p className="font-mono text-xs font-semibold" style={{ color: tone.text }}>
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
}
