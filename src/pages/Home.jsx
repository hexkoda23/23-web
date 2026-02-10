
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';

export default function Home() {
  const unreleasedProducts = PRODUCTS.filter(p => p.category === 'unreleased').slice(0, 4);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-gray-200">
           <img 
             src="/lookbook/18.jpg" 
             alt="Hero" 
             className="w-full h-full object-cover object-top opacity-90"
           />
           <div className="absolute inset-0 bg-black/10" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-sm md:text-base font-bold tracking-[0.2em] uppercase">Spring Summer 2026</h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter">
              REDEFINING<br />MODERN STYLE
            </h1>
            <div className="pt-8">
              <Link 
                to="/shop" 
                className="inline-block border border-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
              >
                Explore the Collection
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/shop?category=tops" className="relative group overflow-hidden aspect-[4/5] md:aspect-auto md:h-[600px]">
              <img 
                src="/lookbook/3.jpg" 
                alt="Tops" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="text-3xl font-bold uppercase tracking-tighter mb-2">23</h3>
                <span className="text-xs font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white transition-all pb-1">
                  Explore
                </span>
              </div>
            </Link>
            <Link to="/shop?category=unreleased" className="relative group overflow-hidden aspect-[4/5] md:aspect-auto md:h-[600px]">
              <img 
                src="/wardrobe/red f.jpg" 
                alt="Unreleased" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="text-3xl font-bold uppercase tracking-tighter mb-2">Unreleased</h3>
                <span className="text-xs font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white transition-all pb-1">
                  Explore
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">New Arrivals</h2>
            <Link to="/shop" className="hidden md:flex items-center text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">
              View All <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {unreleasedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">
              View All <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-black text-white text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">Join the Movement</h2>
          <p className="text-gray-400 leading-relaxed">
            Be the first to know about new collections, exclusive events, and behind-the-scenes content.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
              className="bg-transparent border border-gray-700 px-4 py-3 text-sm w-full outline-none focus:border-white transition-colors text-white"
            />
            <button className="bg-white text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
