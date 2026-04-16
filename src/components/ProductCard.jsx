import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  // Select first and second images (fallback to single image logic if second isn't available)
  const image1 = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;
  const image2 = Array.isArray(product.images) && product.images.length > 1 ? product.images[1] : image1;

  // Format price
  const formattedPrice = `₦${Number(product.price).toLocaleString('en-NG')}`;

  return (
    <Link to={`/product/${product.id}`} className="group block product-card" data-cursor="VIEW">
      <div className="relative aspect-[3/4] bg-[var(--cream)] overflow-hidden">
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

        {/* Media */}
        <div className="w-full h-full relative overflow-hidden">
          <motion.img
            src={image1}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-350 ease-in-out group-hover:opacity-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
          <motion.img
            src={image2}
            alt={`${product.name} alternate`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-350 ease-in-out group-hover:opacity-100"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Slide Up Drawer */}
        <div className="absolute bottom-0 left-0 right-0 h-[90px] bg-white translate-y-full transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 p-4 flex flex-col justify-between border-t border-black/5 z-20">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-body font-semibold text-sm leading-tight text-black line-clamp-1 flex-1">
              {product.name}
            </h3>
            <span className="font-mono text-[11px] font-medium text-[var(--muted)]">
              {formattedPrice}
            </span>
          </div>

          <button
            className="w-full py-2 bg-[var(--cream)] hover:bg-[var(--accent)] text-black font-mono text-[10px] uppercase tracking-[0.2em] font-bold transition-colors active:scale-[0.98] mt-1"
            onClick={(e) => {
              e.preventDefault();
              alert(`Added ${product.name} to cart`);
            }}
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Default text underneath product (only visible before hover or on mobile) */}
      <div className="mt-3 flex justify-between items-start group-hover:-translate-y-2 group-hover:opacity-0 transition-all duration-300">
        <div>
          <h3 className="font-body font-medium text-[15px] leading-tight text-black">
            {product.name}
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#888]">
            {product.category}
          </p>
        </div>
        <p className="font-mono text-xs font-semibold text-black">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
}
