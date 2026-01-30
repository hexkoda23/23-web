
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-white text-black font-sans antialiased selection:bg-black selection:text-white">
        <ScrollToTop />
        <Navbar />
        <CartDrawer />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/outfit-generator" element={<OutfitGenerator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/account" element={<Account />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
        <ChatBot />
      </div>
    </CartProvider>
  );
}

export default App;
