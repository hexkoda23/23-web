import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import OutfitGenerator from './pages/OutfitGenerator';
import AIStudio from './pages/AIStudio';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Account from './pages/Account';
import Messages from './pages/Messages';
import Checkout from './pages/Checkout';
import ChatBot from './components/ChatBot';
import Lookbook from './pages/Lookbook';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import IdentityForge from './pages/IdentityForge';
import DigitalProfile from './pages/DigitalProfile';
import SizeGuide from './pages/SizeGuide';
import LoadingScreen from './components/LoadingScreen';
import GrowthAdmin from './pages/GrowthAdmin';
import StoreAnalytics from './components/StoreAnalytics';
import Privacy from './pages/Privacy';

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isDarkPage = ['/', '/lookbook'].includes(location.pathname);
  const hideChat = location.pathname === '/ai-studio' || location.pathname.startsWith('/admin');

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-white text-black font-body antialiased selection:bg-[var(--accent)] selection:text-black">
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

        <ScrollToTop />
        <StoreAnalytics />
        <Navbar />
        <CartDrawer />
        <main id="main-content" className={`site-main page-${location.pathname.split('/')[1] || 'home'} flex-grow ${isDarkPage ? 'campaign-page' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="/product/:id" element={<ProductDetails key={location.pathname} />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/outfit-generator" element={<OutfitGenerator />} />
            <Route path="/ai-studio" element={<AIStudio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/account" element={<Account />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/identity-forge" element={<ProtectedRoute><IdentityForge /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<DigitalProfile />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/admin" element={<GrowthAdmin />} />
            <Route path="/admin/growth" element={<GrowthAdmin />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
        {!hideChat && <ChatBot />}
      </div>
    </CartProvider>
  );
}

export default App;
