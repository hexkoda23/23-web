import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Link } from 'react-router-dom';

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter(p => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q))
      );
    }).slice(0, 10);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-[90]"
          >
            <div className="bg-white shadow-2xl border border-gray-200">
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <Search size={18} className="text-gray-500" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search products"
                  className="ml-3 flex-1 outline-none text-sm"
                />
                <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {query && results.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No results found
                  </div>
                )}
                {results.map(item => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white flex-shrink-0 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium uppercase tracking-wide">{item.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                    </div>
                    <div className="text-sm font-medium">₦{Number(item.price).toLocaleString('en-NG')}</div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
