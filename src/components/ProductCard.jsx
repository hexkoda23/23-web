
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center"
        />
        {product.category === 'unreleased' && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
            Unreleased
          </div>
        )}
        {product.comingSoon && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
            Coming Soon
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
            Sold Out
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500 capitalize">{product.category}</p>
          {product.comingSoon && product.preorderAvailable && (
            <p className="mt-1 text-[10px] uppercase text-gray-700">Pre-Order Available</p>
          )}
          {product.category === 'unreleased' && (
            <p className="mt-1 text-[10px] uppercase text-gray-700">Contact to Customize</p>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900">
          {product.category === 'unreleased' ? 'XX' : `₦${Number(product.price).toLocaleString('en-NG')}`}
        </p>
      </div>
    </Link>
  );
}
