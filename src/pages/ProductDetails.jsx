
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCTS } from '../data/products';

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
  const isUnreleased = product?.category === 'unreleased';
  const siblingVariants = product?.variantGroup
    ? PRODUCTS.filter(p => p.variantGroup === product.variantGroup && p.id !== product.id)
    : [];

  useEffect(() => {
    if (!product) {
      navigate('/shop');
    }
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

  return (
    <div className="pt-32 pb-20 min-h-screen relative">
      {/* Customization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
        </div>
      )}

      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-[3/4] bg-white overflow-hidden flex items-center justify-center"
            >
              <img
                src={(product.images && product.images[selectedImageIndex]) || product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </motion.div>
            <div className="flex gap-3 overflow-x-auto">
              {(product.images || [product.image]).map((img, idx) => (
                <button
                  key={img + idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-24 border ${selectedImageIndex === idx ? 'border-black' : 'border-gray-200'}`}
                >
                  <img src={img} alt={product.name + ' alt ' + idx} className="w-full h-full object-contain bg-white" />
                </button>
              ))}
            </div>
            {siblingVariants.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-700">
                  Other Options
                </h4>
                <div className="flex gap-3 overflow-x-auto">
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
          </div>

          {/* Product Info */}
          <div className="md:pt-10 space-y-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase mb-2">{product.name}</h1>
              <p className="text-xl text-gray-900">
                {isUnreleased ? 'XX' : `₦${Number(product.price).toLocaleString('en-NG')}`}
              </p>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {product.description}
            </p>

            {product.writeUp && (
              <div className="pt-4 border-t border-gray-100 mt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-900 italic">The Story</h3>
                <p className="text-gray-700 leading-relaxed text-sm italic font-serif">
                  "{product.writeUp}"
                </p>
              </div>
            )}

            {/* Sizes */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-900">Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setError('');
                    }}
                    className={`w-12 h-12 flex items-center justify-center border text-sm transition-all ${selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-black'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            {/* Quantity */}
            <div>
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
            </div>

            {/* Add to Cart / Pre-Order / Unreleased */}
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

            {/* Additional Info */}
            <div className="pt-8 border-t border-gray-200 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>Free standard shipping</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Returns</span>
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
