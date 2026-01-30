
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { PRODUCTS } from '../data/products';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = PRODUCTS.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const isUnreleased = product?.category === 'unreleased';

  useEffect(() => {
    if (!product) {
      navigate('/shop');
    }
  }, [product, navigate]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (isUnreleased) {
      navigate('/contact');
      return;
    }
    if (!selectedSize && product.sizes.length > 0) {
      setError('Please select a size');
      return;
    }
    setError('');
    addToCart(product, selectedSize, quantity);
  };

  return (
    <div className="pt-32 pb-20 min-h-screen">
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
              className="aspect-[3/4] bg-gray-100 overflow-hidden"
            >
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </motion.div>
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
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
                This item is not yet available. It can be customized for you, but delivery may take longer.
                Please send a message on the <button onClick={() => navigate('/contact')} className="underline font-semibold">Contact</button> page.
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={(!product.inStock && !product.preorderAvailable) && !isUnreleased}
              className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isUnreleased
                ? 'Contact to Customize'
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
