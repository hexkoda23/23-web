
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  // We'll use this as a slide-over cart drawer instead of a full page, 
  // but if the user navigates to /cart directly, it will show as a page.
  // For now, let's implement the Cart Drawer component here and use it in the layout.
  // Wait, the prompt asked for /cart route. So I will make a full page version too.

  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold uppercase tracking-tighter mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link 
          to="/shop" 
          className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tighter uppercase mb-12">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-6 py-6 border-b border-gray-100">
                <div className="w-24 h-32 bg-gray-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold uppercase tracking-wide">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                      <p className="text-sm text-gray-500 mt-1 capitalize">{item.category} — {item.size}</p>
                      {item.comingSoon && (
                        <p className="text-xs uppercase text-yellow-700 mt-1">Pre-Order</p>
                      )}
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-gray-200">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="w-8 text-center text-xs">{item.quantity}</div>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold">₦{Number(item.price * item.quantity).toLocaleString('en-NG')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-8 sticky top-32">
              <h3 className="text-lg font-bold uppercase tracking-wide mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{Number(getCartTotal()).toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-8 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₦{Number(getCartTotal()).toLocaleString('en-NG')}</span>
              </div>

              <button onClick={handleCheckout} className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center">
                Checkout <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
