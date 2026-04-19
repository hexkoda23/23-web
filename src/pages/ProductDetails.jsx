
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCTS } from '../data/products';

// Slide-up animation variants
const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

// Splits text into individual lines/words for animated reveal
function AnimatedText({ text, className, delay = 0, tag: Tag = 'p' }) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: '110%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      >
        <Tag className={className}>{text}</Tag>
      </motion.div>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  const product = PRODUCTS.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const isUnreleased = product?.category === 'unreleased';
  const siblingVariants = product?.variantGroup
    ? PRODUCTS.filter(p => p.variantGroup === product.variantGroup && p.id !== product.id)
    : [];

  useEffect(() => {
    if (!product) {
      navigate('/shop');
    }
    // reset image when product changes
    setSelectedImageIndex(0);
    setStoryExpanded(false);
  }, [product, navigate]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 0 && product.sizes[0] !== 'coming soon') {
      setError('Please select a size');
      return;
    }
    setError('');
    setIsModalOpen(true);
  };

  const confirmAddToCart = (customize) => {
    if (customize) {
      const productData = { product, selectedSize, quantity };
      if (!currentUser) {
        try {
          localStorage.setItem('pendingCustomization', JSON.stringify(productData));
        } catch (e) { }
        navigate('/login?redirect=/identity-forge');
        return;
      }
      navigate('/identity-forge', { state: { productData } });
    } else {
      addToCart(product, selectedSize, quantity);
      setIsModalOpen(false);
    }
  };

  const allImages = product.images || [product.image];

  return (
    <div className="pt-32 pb-20 min-h-screen relative">
      {/* Customization Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white p-8 max-w-md w-full shadow-2xl space-y-6 text-center"
            >
              <h2 className="text-2xl font-bold uppercase tracking-tighter">Choose Your Identity</h2>
              <p className="text-gray-600 text-sm">
                Would you like to customize your barcode with your personal digital signature, or proceed with the standard 23 barcode?
              </p>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => confirmAddToCart(true)}
                  className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Customize Barcode
                </button>
                <button
                  onClick={() => confirmAddToCart(false)}
                  className="w-full bg-transparent border border-gray-200 text-black py-4 text-sm font-bold uppercase tracking-widest hover:border-black transition-colors"
                >
                  Use Initial Barcode
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-gray-400 hover:text-black uppercase tracking-widest mt-4"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6">
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-center text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="aspect-[3/4] bg-white overflow-hidden flex items-center justify-center"
              >
                <img
                  src={allImages[selectedImageIndex] || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {/* Thumbnail Strip */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allImages.map((img, idx) => (
                <button
                  key={img + idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-24 border flex-shrink-0 transition-all duration-200 ${
                    selectedImageIndex === idx ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={product.name + ' view ' + idx} className="w-full h-full object-contain bg-white" />
                </button>
              ))}
            </div>

            {/* Sibling Variants */}
            {siblingVariants.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-700">
                  Other Colourways
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {siblingVariants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => navigate(`/product/${v.id}`)}
                      className="w-16 h-20 border border-gray-200 hover:border-black transition-colors flex-shrink-0"
                      title={v.name}
                    >
                      <img src={v.image} alt={v.name} className="w-full h-full object-contain bg-white" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Product Info — slide-up entrance */}
          <motion.div
            className="md:pt-10 space-y-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Title */}
            <div>
              <div className="overflow-hidden mb-2">
                <motion.h1
                  className="text-3xl md:text-5xl font-bold tracking-tighter uppercase"
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                >
                  {product.name}
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.p
                  className="text-xl text-gray-900"
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                >
                  {isUnreleased ? 'Price on Release' : `₦${Number(product.price).toLocaleString('en-NG')}`}
                </motion.p>
              </div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
            >
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {product.description}
              </p>
            </motion.div>

            {/* The Story — animated slide-up with expand toggle */}
            {product.writeUp && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
                className="pt-4 border-t border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900">
                    — The Story
                  </h3>
                  <button
                    onClick={() => setStoryExpanded(!storyExpanded)}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  >
                    {storyExpanded ? 'Collapse' : 'Read Full'}
                  </button>
                </div>

                {/* Story text with slide-up line reveal */}
                <div className="relative overflow-hidden">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={storyExpanded ? 'expanded' : 'collapsed'}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* Always show first sentence */}
                    </motion.div>
                  </AnimatePresence>

                  {/* First chunk always visible */}
                  <motion.p
                    className="text-gray-700 leading-relaxed text-sm italic font-serif"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  >
                    {storyExpanded
                      ? `"${product.writeUp}"`
                      : `"${product.writeUp.split('. ').slice(0, 2).join('. ')}${product.writeUp.split('. ').length > 2 ? '...' : ''}"`
                    }
                  </motion.p>
                </div>

                {/* Animated gradient fade hint when collapsed */}
                {!storyExpanded && product.writeUp.split('. ').length > 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3"
                  >
                    <button
                      onClick={() => setStoryExpanded(true)}
                      className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 hover:gap-3 transition-all duration-300"
                    >
                      Continue Reading
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Sizes */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.42 }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-900">Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setError('');
                    }}
                    className={`w-12 h-12 flex items-center justify-center border text-sm transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </motion.div>

            {/* Quantity */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-900">Quantity</h3>
              <div className="flex items-center border border-gray-200 w-32">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 text-center text-sm">{quantity}</div>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </motion.div>

            {/* Alerts & CTA */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.58 }}
            >
              {product.comingSoon && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
                  This item is a new arrival. Pre-order now to reserve yours.
                </div>
              )}
              {isUnreleased && (
                <div className="rounded-md bg-amber-50 border border-amber-300 p-4 text-sm text-amber-900 space-y-1">
                  <p className="font-bold uppercase tracking-wide text-xs">⚠️ Unreleased Item</p>
                  <p>This item is not yet in full production. You can still order it, but delivery may take <strong>1 week</strong> as it will be specially crafted for you. We appreciate your patience.</p>
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={(!product.inStock && !product.preorderAvailable) && !isUnreleased}
                className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isUnreleased
                  ? 'Add to Cart'
                  : product.comingSoon && product.preorderAvailable
                    ? 'Pre-Order'
                    : product.inStock
                      ? 'Add to Cart'
                      : 'Out of Stock'}
              </button>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              className="pt-8 border-t border-gray-200 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>Free standard shipping</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Returns</span>
                <span>30-day return policy</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
