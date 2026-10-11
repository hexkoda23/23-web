
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'unreleased', name: 'Unreleased' },
  { id: 'new', name: 'New Arrivals' },
  { id: 'tops', name: 'Tops' },
  { id: 'bottoms', name: 'Bottoms' },
  { id: 'outerwear', name: 'Outerwear' },
  { id: 'shoes', name: 'Shoes' },
  { id: 'accessories', name: 'Accessories' },
];

const REPRESENTATIVE_BY_GROUP = {
  '23x-color': 'top-21',
  '23x-gym': 'gym-1',
  '23x-denim': 'bottom-10',
  '23x-twentythree': 'top-xxiii-coll',
  '23x-xxiii': 'top-20',
  '23x-motion': 'top-29',
  '23x-ascend': 'top-30',
  '23x-hoodie': 'top-11',
  '23x-sweats': 'top-37',
};

const compressByVariantGroup = (list) => {
  const out = [];
  const seen = new Set();
  const indexById = new Map(list.map(p => [p.id, p]));
  for (const p of list) {
    if (p.variantGroup) {
      if (seen.has(p.variantGroup)) continue;
      const preferredId = REPRESENTATIVE_BY_GROUP[p.variantGroup];
      const preferred = preferredId && indexById.get(preferredId);
      out.push(preferred || p);
      seen.add(p.variantGroup);
    } else {
      out.push(p);
    }
  }
  return out;
};


export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(100000);

  const newProducts = useMemo(() => {
    const list = PRODUCTS.filter(p => p.category === 'new' && !p.hidden && p.price <= priceRange);
    return compressByVariantGroup(list);
  }, [priceRange]);
  const unreleasedProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.category === 'unreleased' && !p.hidden && p.price <= priceRange);
  }, [priceRange]);
  const unreleasedDisplay = useMemo(() => {
    return compressByVariantGroup(unreleasedProducts);
  }, [unreleasedProducts]);
  const filteredProducts = useMemo(() => {
    const matchCategory = (product) => {
      if (currentCategory === 'all') return true;
      if (currentCategory === 'new' || currentCategory === 'unreleased') {
        return product.category === currentCategory;
      }
      if (currentCategory === 'tops') {
        return product.id?.startsWith('top-');
      }
      if (currentCategory === 'bottoms') {
        const id = product.id || '';
        const name = (product.name || '').toLowerCase();
        return id.startsWith('bottom-') || id.startsWith('bpttom-') || id.startsWith('trouser-') ||
          name.includes('pant') || name.includes('jean') || name.includes('jogger');
      }
      if (currentCategory === 'outerwear') {
        const name = (product.name || '').toLowerCase();
        return (product.id?.startsWith('outer-')) || name.includes('jacket') || name.includes('hoodie');
      }
      if (currentCategory === 'accessories') {
        return product.category === 'accessories' || product.id?.startsWith('acc-');
      }
      return product.category === currentCategory;
    };
    const matches = PRODUCTS.filter(product => matchCategory(product) && !product.hidden && product.price <= priceRange);
    const seenNewGroups = new Set();
    return matches.filter(product => {
      if (!product.collectionName) return true;
      if (seenNewGroups.has(product.variantGroup)) return false;
      seenNewGroups.add(product.variantGroup);
      return true;
    });
  }, [currentCategory, priceRange]);

  const handleCategoryChange = (category) => {
    setSearchParams(category === 'all' ? {} : { category });
    setIsFilterOpen(false);
  };

  return (
    <div className="pb-20 min-h-screen">
      <section className="shop-intro"><p className="eyebrow">Twenty3 · Ready-to-wear</p><h1>The collection</h1><p>Discover our latest collection of premium essentials, crafted for the modern individual. Luxury. Identity. Exclusivity.</p></section>
      <div className="container mx-auto px-6">

        <div className="shop-toolbar">
          <nav className="shop-categories" aria-label="Product categories">{CATEGORIES.map(cat => <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} className={currentCategory === cat.id ? 'active' : ''} aria-pressed={currentCategory === cat.id}>{cat.name}</button>)}</nav>
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} aria-expanded={isFilterOpen} className="flex items-center gap-2 text-[10px] uppercase tracking-widest"><Filter size={15} strokeWidth={1.3} />Refine selection</button>
        </div>

        {/* Mobile/Desktop Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <Motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12 border-b border-gray-200 pb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-900">Categories</h3>
                  <div className="flex flex-wrap gap-4">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`text-sm transition-colors ${currentCategory === cat.id
                          ? 'text-black font-bold underline underline-offset-4'
                          : 'text-gray-500 hover:text-black'
                          }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-900">
                    Max Price: ₦{Number(priceRange).toLocaleString('en-NG')}
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>₦0</span>
                    <span>₦100,000+</span>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {currentCategory === 'all' && (
          <>
            {newProducts.length > 0 && (
              <div className="mb-16">
                <h2 className="attention-product attention-heading text-black text-3xl md:text-5xl mb-6">Newly Arrived</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                  {newProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
            {unreleasedProducts.length > 0 && (
              <div>
                <h2 className="attention-product attention-heading text-black text-3xl md:text-5xl mb-6">Unreleased</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                  {unreleasedDisplay.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {currentCategory === 'new' && (
          <>
            <h2 className="attention-product attention-heading text-black text-3xl md:text-5xl mb-6">Newly Arrived</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {currentCategory === 'unreleased' && (
          <>
            <h2 className="attention-product attention-heading text-black text-3xl md:text-5xl mb-6">Unreleased</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {unreleasedDisplay.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {currentCategory !== 'all' && currentCategory !== 'new' && currentCategory !== 'unreleased' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {(currentCategory === 'all' && newProducts.length === 0 && unreleasedProducts.length === 0) ||
          (currentCategory === 'new' && newProducts.length === 0) ||
          (currentCategory === 'unreleased' && unreleasedProducts.length === 0) ||
          (currentCategory !== 'all' && currentCategory !== 'new' && currentCategory !== 'unreleased' && filteredProducts.length === 0)
          ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchParams({});
                  setPriceRange(100000);
                }}
                className="mt-4 text-sm font-bold uppercase tracking-widest border-b border-black pb-1"
              >
                Clear Filters
              </button>
            </div>
          ) : null}
      </div>
    </div>
  );
}
