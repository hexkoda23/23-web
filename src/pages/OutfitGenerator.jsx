
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCw, Plus, Trash2, Check, X, Shirt, Scissors } from "lucide-react";
import { getUserData, setUserData } from "../utils/userStorage";
import { WARDROBE_CATEGORIES } from "../data/wardrobeItems";
import PageTransition from "../components/PageTransition";

export default function OutfitGenerator() {
  const storageUserId = "local_outfit_planner";
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [customItems, setCustomItems] = useState([]);
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [activeCategory, setActiveCategory] = useState("tops");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dailyOutfits, setDailyOutfits] = useState({});

  // Initialize data
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load custom items
    const savedCustom = getUserData(storageUserId, "customWardrobeItems", []);
    if (savedCustom) setCustomItems(savedCustom);
    
    // Load selected wardrobe items
    const savedSelected = getUserData(storageUserId, "selectedWardrobe", []);
    if (savedSelected && savedSelected.length > 0) {
      const savedSet = new Set(savedSelected);
      setSelectedItems(savedSet);
      
      // Load daily outfits
      const savedOutfits = getUserData(storageUserId, "dailyOutfits", {});
      setDailyOutfits(savedOutfits);
      
      const dateKey = new Date().toDateString();
      if (savedOutfits[dateKey]) {
        setGeneratedOutfit(savedOutfits[dateKey]);
      } else {
        generateOutfitAuto(savedSet, new Date(), savedOutfits);
      }
    } else {
      // Select all default items initially if nothing saved
      const allIds = new Set();
      Object.values(WARDROBE_CATEGORIES).forEach(cat => {
        cat.forEach(item => allIds.add(item.id));
      });
      setSelectedItems(allIds);
      generateOutfitAuto(allIds, new Date(), {});
    }
  }, []);

  const generateOutfitAuto = (items = selectedItems, date = currentDate, outfitsData = dailyOutfits, forceNew = false) => {
    if (items.size === 0) return;
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const dateKey = date.toDateString();
      
      // Use existing if available and not forced
      if (!forceNew && outfitsData[dateKey]) {
        setGeneratedOutfit(outfitsData[dateKey]);
        setIsGenerating(false);
        return;
      }

      // Gather all available items
      const allItems = [];
      Object.values(WARDROBE_CATEGORIES).forEach(cat => {
        cat.forEach(item => {
          if (items.has(item.id)) allItems.push(item);
        });
      });
      customItems.forEach(item => {
        if (items.has(item.id)) allItems.push(item);
      });

      // Categorize
      const tops = allItems.filter(i => i.category === "tops");
      const bottoms = allItems.filter(i => i.category === "bottoms");
      const outerwear = allItems.filter(i => i.category === "outerwear");
      const shoes = allItems.filter(i => i.category === "shoes");
      const accessories = allItems.filter(i => i.category === "accessories");

      const seed = forceNew ? Math.random() * 1000000 : date.getTime();
      const random = (s) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };

      const outfit = {
        top: tops.length ? tops[Math.floor(random(seed) * tops.length)] : null,
        bottom: bottoms.length ? bottoms[Math.floor(random(seed + 1) * bottoms.length)] : null,
        outerwear: (outerwear.length && random(seed + 2) > 0.5) ? outerwear[Math.floor(random(seed + 2) * outerwear.length)] : null,
        shoes: shoes.length ? shoes[Math.floor(random(seed + 3) * shoes.length)] : null,
        accessory: (!outerwear.length && accessories.length && random(seed + 4) > 0.4)
          ? accessories[Math.floor(random(seed + 4) * accessories.length)]
          : (outerwear.length === 0 && accessories.length ? accessories[0] : null),
      };

      const newOutfits = { ...outfitsData, [dateKey]: outfit };
      setDailyOutfits(newOutfits);
      setUserData(storageUserId, "dailyOutfits", newOutfits);
      setGeneratedOutfit(outfit);
      setIsGenerating(false);
    }, 600);
  };

  const handleDateChange = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    
    const dateKey = newDate.toDateString();
    if (dailyOutfits[dateKey]) {
      setGeneratedOutfit(dailyOutfits[dateKey]);
    } else {
      generateOutfitAuto(selectedItems, newDate, dailyOutfits);
    }
  };

  const toggleItemSelection = (id) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    
    setSelectedItems(newSet);
    setUserData(storageUserId, "selectedWardrobe", [...newSet]);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4 text-center">
              Outfit Generator
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-xs text-center max-w-md">
              Curate your daily look with AI-powered suggestions based on your personal wardrobe.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Wardrobe Manager */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-gray-50 p-6">
                <h2 className="text-lg font-bold uppercase tracking-widest mb-6 flex items-center justify-between">
                  <span>My Wardrobe</span>
                  <span className="text-xs text-gray-400">{selectedItems.size} items active</span>
                </h2>
                
                <div className="flex space-x-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                  {['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeCategory === cat 
                          ? 'bg-black text-white' 
                          : 'bg-white text-gray-500 border border-gray-200 hover:border-black'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {WARDROBE_CATEGORIES[activeCategory]?.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`relative aspect-[3/4] cursor-pointer group transition-all duration-300 ${
                        selectedItems.has(item.id) ? 'opacity-100 ring-1 ring-black' : 'opacity-40 hover:opacity-70'
                      }`}
                    >
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover bg-gray-200"
                      />
                      {selectedItems.has(item.id) && (
                        <div className="absolute top-1 right-1 bg-black text-white p-0.5">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Generator Display */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8 bg-black text-white p-4">
                <button onClick={() => handleDateChange(-1)} className="hover:text-gray-400 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm uppercase tracking-[0.2em] font-medium">
                  {formatDate(currentDate)}
                </span>
                <button onClick={() => handleDateChange(1)} className="hover:text-gray-400 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="relative min-h-[600px] bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10"
                    >
                      <RefreshCw className="animate-spin mb-4" size={32} />
                      <span className="text-xs uppercase tracking-widest">Curating Look...</span>
                    </motion.div>
                  ) : generatedOutfit ? (
                    <motion.div
                      key={currentDate.toISOString()}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="w-full max-w-2xl grid grid-cols-2 gap-8"
                    >
                      {/* Top Left: Top */}
                      <div className="col-span-1 space-y-2">
                         <span className="text-[10px] uppercase tracking-widest text-gray-400">Top</span>
                         <div className="aspect-[3/4] bg-white shadow-sm p-2">
                           {generatedOutfit.top ? (
                             <img src={generatedOutfit.top.image} className="w-full h-full object-cover" alt="Top" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300"><Shirt /></div>
                           )}
                         </div>
                         <p className="text-xs uppercase font-bold truncate">{generatedOutfit.top?.name || "None"}</p>
                      </div>

                      {/* Top Right: Outerwear (if exists) or Accessory */}
                      <div className="col-span-1 space-y-2 pt-12">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400">{generatedOutfit.outerwear ? 'Layer' : (generatedOutfit.accessory ? 'Accessory' : 'Layer')}</span>
                        <div className="aspect-[3/4] bg-white shadow-sm p-2">
                          {generatedOutfit.outerwear ? (
                            <img src={generatedOutfit.outerwear.image} className="w-full h-full object-cover" alt="Outerwear" />
                          ) : generatedOutfit.accessory ? (
                            <img src={generatedOutfit.accessory.image} className="w-full h-full object-cover" alt="Accessory" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-xs uppercase">No Layer</div>
                          )}
                        </div>
                        <p className="text-xs uppercase font-bold truncate">{generatedOutfit.outerwear?.name || generatedOutfit.accessory?.name || "-"}</p>
                      </div>

                      {/* Bottom Left: Bottom */}
                      <div className="col-span-1 space-y-2 -mt-12">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400">Bottom</span>
                        <div className="aspect-[3/4] bg-white shadow-sm p-2">
                          {generatedOutfit.bottom ? (
                            <img src={generatedOutfit.bottom.image} className="w-full h-full object-cover" alt="Bottom" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300"><Scissors /></div>
                          )}
                        </div>
                        <p className="text-xs uppercase font-bold truncate">{generatedOutfit.bottom?.name || "None"}</p>
                      </div>

                      {/* Bottom Right: Shoes */}
                      <div className="col-span-1 space-y-2">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400">Footwear</span>
                        <div className="aspect-[3/4] bg-white shadow-sm p-2">
                          {generatedOutfit.shoes ? (
                            <img src={generatedOutfit.shoes.image} className="w-full h-full object-cover" alt="Shoes" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">No Shoes</div>
                          )}
                        </div>
                        <p className="text-xs uppercase font-bold truncate">{generatedOutfit.shoes?.name || "None"}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 uppercase tracking-widest text-sm">No outfit generated</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => generateOutfitAuto(selectedItems, currentDate, dailyOutfits, true)}
                  disabled={isGenerating}
                  className="bg-black text-white px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {isGenerating ? "Processing..." : "Generate New Look"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
