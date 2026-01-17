import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { getUserData, setUserData } from "../utils/userStorage";
import PageTransition from "../components/PageTransition.jsx";
import { WARDROBE_CATEGORIES, LOOKBOOK_ITEMS } from "../data/wardrobeItems.js";

function OutfitGenerator() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [customItems, setCustomItems] = useState([]); // User's custom wardrobe items
  const [currentDate, setCurrentDate] = useState(new Date());
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [showWardrobe, setShowWardrobe] = useState(true);
  const [showWardrobeManager, setShowWardrobeManager] = useState(false);
  const [showWardrobePage, setShowWardrobePage] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [dailyOutfits, setDailyOutfits] = useState({});
  const [manualMode, setManualMode] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  
  // New item form state
  const [newItem, setNewItem] = useState({
    name: "",
    category: "tops",
    image: null,
    imageUrl: ""
  });

  useEffect(() => {
    if (!currentUser) return;
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    const userId = currentUser.uid;
    
    // Check if intro has been shown before
    const introShown = getUserData(userId, "outfitIntroShown", false);
    
    // Check last visit date
    const lastVisit = getUserData(userId, "outfitLastVisit", null);
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    // Show welcome back if it's been 3+ days since last visit
    if (lastVisit) {
      const lastVisitDate = new Date(lastVisit);
      if (lastVisitDate < threeDaysAgo) {
        setShowWelcomeBack(true);
      }
    }
    
    // Show intro only if never shown before
    if (!introShown) {
      setShowIntro(true);
    }
    
    // Update last visit timestamp
    setUserData(userId, "outfitLastVisit", now.toISOString());
    
    // Load custom items (user-specific)
    const savedCustom = getUserData(userId, "customWardrobeItems", []);
    if (savedCustom && savedCustom.length > 0) {
      setCustomItems(savedCustom);
    }
    
    // Load saved wardrobe selection (user-specific)
    const saved = getUserData(userId, "selectedWardrobe", []);
    if (saved && saved.length > 0) {
      const savedSet = new Set(saved);
      setSelectedItems(savedSet);
      setShowWardrobe(false);
      
      // Load saved daily outfits (user-specific)
      const savedOutfits = getUserData(userId, "dailyOutfits", {});
      const dateKey = new Date().toDateString();
      
      if (Object.keys(savedOutfits).length > 0) {
        setDailyOutfits(savedOutfits);
        if (savedOutfits[dateKey]) {
          setGeneratedOutfit(JSON.parse(JSON.stringify(savedOutfits[dateKey])));
        } else {
          // Auto-generate outfit for today
          setTimeout(() => {
            generateOutfitAuto(savedSet, new Date(), savedOutfits);
          }, 100);
        }
      } else {
        // Auto-generate outfit for today
        setTimeout(() => {
          generateOutfitAuto(savedSet, new Date(), {});
        }, 100);
      }
    } else {
      // First time user - must select wardrobe
      setShowWardrobe(true);
    }
  }, [currentUser]);
  
  const handleStartPlanning = () => {
    if (currentUser) {
      const userId = currentUser.uid;
      setUserData(userId, "outfitIntroShown", true);
    }
    setShowIntro(false);
    setShowWelcomeBack(false);
  };


  // Auto-generate outfit function
  const generateOutfitAuto = (items = selectedItems, date = currentDate, outfitsData = dailyOutfits, forceNew = false) => {
    if (items.size === 0) return;

    const dateKey = date.toDateString();
    
    // Check if outfit already generated for this date (only if not forcing new)
    if (!forceNew && outfitsData[dateKey]) {
      setGeneratedOutfit(outfitsData[dateKey]);
      return;
    }

    // Get all selected items (from default + custom items)
    const allItems = [];
    
    // Add default items that are selected
    Object.values(WARDROBE_CATEGORIES).forEach(category => {
      category.forEach(item => {
        if (items.has(item.id)) {
          allItems.push(item);
        }
      });
    });
    
    // Add custom items that are selected (user-specific)
    const savedCustom = currentUser ? getUserData(currentUser.uid, "customWardrobeItems", []) : [];
    savedCustom.forEach(item => {
      if (items.has(item.id)) {
        allItems.push(item);
      }
    });

    // Generate outfit with random seed (different each time)
    const seed = forceNew ? Math.random() * 1000000 + Date.now() : date.getTime();
    const random = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Select one item from each category
    const outfit = {
      top: null,
      bottom: null,
      outerwear: null,
      shoes: null,
      accessories: [],
    };

    const tops = allItems.filter(item => item.category === "tops");
    const bottoms = allItems.filter(item => item.category === "bottoms");
    const outerwear = allItems.filter(item => item.category === "outerwear");
    const shoes = allItems.filter(item => item.category === "shoes");
    const accessories = allItems.filter(item => item.category === "accessories");

    if (tops.length > 0) {
      outfit.top = tops[Math.floor(random(seed) * tops.length)];
    }
    if (bottoms.length > 0) {
      outfit.bottom = bottoms[Math.floor(random(seed + 1) * bottoms.length)];
    }
    if (outerwear.length > 0 && random(seed + 2) > 0.5) {
      outfit.outerwear = outerwear[Math.floor(random(seed + 2) * outerwear.length)];
    }
    if (shoes.length > 0) {
      outfit.shoes = shoes[Math.floor(random(seed + 3) * shoes.length)];
    }
    if (accessories.length > 0) {
      const accCount = Math.min(2, accessories.length);
      for (let i = 0; i < accCount; i++) {
        const acc = accessories[Math.floor(random(seed + 4 + i) * accessories.length)];
        if (!outfit.accessories.find(a => a.id === acc.id)) {
          outfit.accessories.push(acc);
        }
      }
    }

    // Save outfit for this date (user-specific)
    const newDailyOutfits = { ...outfitsData, [dateKey]: outfit };
    setDailyOutfits(newDailyOutfits);
    if (currentUser) {
      setUserData(currentUser.uid, "dailyOutfits", newDailyOutfits);
    }
    setGeneratedOutfit(outfit);
  };

  // Get all available wardrobe items (default + custom)
  const getAllWardrobeItems = () => {
    const allItems = [];
    
    // Add default items
    Object.values(WARDROBE_CATEGORIES).forEach(category => {
      category.forEach(item => {
        allItems.push(item);
      });
    });
    
    // Add custom items (user-specific)
    const savedCustom = currentUser ? getUserData(currentUser.uid, "customWardrobeItems", []) : [];
    savedCustom.forEach(item => {
      allItems.push(item);
    });
    
    return allItems;
  };

  const handleItemToggle = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    if (currentUser) {
      setUserData(currentUser.uid, "selectedWardrobe", [...newSelected]);
    }
  };

  const handleAddCustomItem = async () => {
    if (!newItem.name || (!newItem.image && !newItem.imageUrl)) {
      alert("Please provide a name and image for your item!");
      return;
    }

    let imageData = newItem.imageUrl;
    
    // If image file is provided, convert to base64
    if (newItem.image) {
      imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(newItem.image);
      });
    }

    const customItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newItem.name,
      category: newItem.category,
      image: imageData,
      isCustom: true
    };

    const updatedCustom = [...customItems, customItem];
    setCustomItems(updatedCustom);
    if (currentUser) {
      setUserData(currentUser.uid, "customWardrobeItems", updatedCustom);
    }

    // Automatically select the new item
    const newSelected = new Set(selectedItems);
    newSelected.add(customItem.id);
    setSelectedItems(newSelected);
    if (currentUser) {
      setUserData(currentUser.uid, "selectedWardrobe", [...newSelected]);
    }

    // Reset form
    setNewItem({ name: "", category: "tops", image: null, imageUrl: "" });
    setShowAddItem(false);
    alert("Item added to wardrobe and selected! It will be included in your outfit generation.");
  };

  const handleDeleteItem = (itemId) => {
    if (confirm("Are you sure you want to remove this item from your wardrobe?")) {
      // Remove from custom items if it's custom
      const updatedCustom = customItems.filter(item => item.id !== itemId);
      setCustomItems(updatedCustom);
      if (currentUser) {
        setUserData(currentUser.uid, "customWardrobeItems", updatedCustom);
      }

      // Remove from selected items
      const newSelected = new Set(selectedItems);
      newSelected.delete(itemId);
      setSelectedItems(newSelected);
      if (currentUser) {
        setUserData(currentUser.uid, "selectedWardrobe", [...newSelected]);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItem(prev => ({ ...prev, image: file, imageUrl: "" }));
    }
  };

  const generateOutfit = () => {
    if (selectedItems.size === 0) {
      alert("Please select at least one item from your wardrobe first!");
      return;
    }
    // Force new outfit generation each time
    generateOutfitAuto(selectedItems, currentDate, dailyOutfits, true);
  };

  const handleManualSelect = (category, item) => {
    setGeneratedOutfit(prev => {
      // Ensure we have a valid outfit object
      const newOutfit = prev ? { ...prev } : {
        top: null,
        bottom: null,
        outerwear: null,
        shoes: null,
        accessories: [],
      };
      
      if (category === "accessories") {
        // Initialize accessories array if it doesn't exist
        if (!newOutfit.accessories) {
          newOutfit.accessories = [];
        }
        
        // Check if item is already selected
        const existsIndex = newOutfit.accessories.findIndex(a => a && a.id === item.id);
        
        if (existsIndex >= 0) {
          // Remove if already selected
          newOutfit.accessories = newOutfit.accessories.filter((_, index) => index !== existsIndex);
        } else {
          // Add if not selected (max 2 accessories)
          if (newOutfit.accessories.length < 2) {
            newOutfit.accessories = [...newOutfit.accessories, item];
          } else {
            // Replace the first one if already at max
            newOutfit.accessories = [item, newOutfit.accessories[1]].filter(Boolean);
          }
        }
      } else {
        // For other categories, toggle selection
        if (newOutfit[category] && newOutfit[category].id === item.id) {
          // Deselect if already selected
          newOutfit[category] = null;
        } else {
          // Select the item
          newOutfit[category] = item;
        }
      }
      
      return newOutfit;
    });
  };

  const saveManualOutfit = () => {
    // Validate that at least top and bottom are selected
    if (!generatedOutfit || (!generatedOutfit.top || !generatedOutfit.bottom)) {
      alert("Please select at least a top and bottom for your outfit!");
      return;
    }
    
    const dateKey = currentDate.toDateString();
    
    // Create a clean copy of the outfit to save (deep clone to ensure new reference)
    const outfitToSave = JSON.parse(JSON.stringify({
      top: generatedOutfit.top || null,
      bottom: generatedOutfit.bottom || null,
      outerwear: generatedOutfit.outerwear || null,
      shoes: generatedOutfit.shoes || null,
      accessories: generatedOutfit.accessories ? generatedOutfit.accessories.filter(a => a) : [],
    }));
    
    // Use functional update to ensure we have the latest dailyOutfits state
    setDailyOutfits(prev => {
      const newDailyOutfits = { ...prev, [dateKey]: outfitToSave };
      
      // Save to user-specific storage
      if (currentUser) {
        setUserData(currentUser.uid, "dailyOutfits", newDailyOutfits);
      }
      
      // Update the displayed outfit immediately with a fresh deep copy
      const savedOutfitCopy = JSON.parse(JSON.stringify(outfitToSave));
      setGeneratedOutfit(savedOutfitCopy);
      
      return newDailyOutfits;
    });
    
    // Close manual mode
    setManualMode(false);
    
    // Show confirmation
    alert("Outfit saved! Your custom outfit has replaced the generated one for this day.");
  };

  const getRecommendations = () => {
    // Get random recommendations from 23 lookbook
    const shuffled = [...LOOKBOOK_ITEMS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const handleDateChange = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    setManualMode(false);
    
    // Check if outfit exists for new date - load from storage to ensure we have all historical data
    const dateKey = newDate.toDateString();
    
    // Load fresh data from storage to ensure we have all saved outfits
    if (currentUser) {
      const savedOutfits = getUserData(currentUser.uid, "dailyOutfits", {});
      setDailyOutfits(savedOutfits);
      
      if (savedOutfits[dateKey]) {
        // Load existing outfit for this date
        setGeneratedOutfit(JSON.parse(JSON.stringify(savedOutfits[dateKey])));
      } else {
        // Auto-generate for new date if wardrobe is selected
        if (selectedItems.size > 0) {
          generateOutfitAuto(selectedItems, newDate, savedOutfits, false);
        } else {
          setGeneratedOutfit(null);
        }
      }
    } else {
      // Fallback to state if no user
      if (dailyOutfits[dateKey]) {
        setGeneratedOutfit(dailyOutfits[dateKey]);
      } else {
        if (selectedItems.size > 0) {
          generateOutfitAuto(selectedItems, newDate, dailyOutfits, false);
        } else {
          setGeneratedOutfit(null);
        }
      }
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Welcome Back Screen (shows after 3+ days of inactivity)
  if (showWelcomeBack) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-black text-neutral-100 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl w-full space-y-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-8xl mb-4"
            >
              👋
            </motion.div>
            <h1 className="text-5xl sm:text-6xl font-medium text-white leading-tight">
              Welcome Back!
            </h1>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              It's been a while! We've missed you. Ready to get back to planning your daily outfits? 
              Your wardrobe and outfit history are all saved and waiting for you.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartPlanning}
                className="px-12 py-4 bg-white text-black rounded-full text-lg font-medium uppercase tracking-wider hover:bg-neutral-200 transition-colors"
              >
                Continue Planning
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // Intro Screen (shows once for first-time users)
  if (showIntro) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-black text-neutral-100 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl w-full space-y-8"
          >
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-8xl mb-4"
              >
                👔
              </motion.div>
              <h1 className="text-5xl sm:text-6xl font-medium text-white leading-tight">
                Your Style,
                <br />
                <span className="text-neutral-400">Your Way, Every Day</span>
              </h1>
              <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                Tired of standing in front of your closet every morning like it's a daily interrogation? 
                We've got you covered. Literally. Let 23 be your personal stylist that never sleeps (and never judges). 😎
              </p>
            </div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            >
              <div className="border border-neutral-800 rounded-2xl p-6 bg-neutral-950 hover:border-neutral-600 transition-colors">
                <div className="text-4xl mb-4">🎲</div>
                <h3 className="text-lg font-medium text-white mb-2">Auto-Generate Outfits</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Wake up to a fresh, unique outfit every single day. Our algorithm creates 
                  perfectly styled combinations from your wardrobe—no thinking required.
                </p>
              </div>
              
              <div className="border border-neutral-800 rounded-2xl p-6 bg-neutral-950 hover:border-neutral-600 transition-colors">
                <div className="text-4xl mb-4">✂️</div>
                <h3 className="text-lg font-medium text-white mb-2">Build Your Own</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Want full control? Manually select pieces from your wardrobe and create 
                  your perfect fit. Save it, and it becomes your outfit for the day.
                </p>
              </div>
              
              <div className="border border-neutral-800 rounded-2xl p-6 bg-neutral-950 hover:border-neutral-600 transition-colors">
                <div className="text-4xl mb-4">🛍️</div>
                <h3 className="text-lg font-medium text-white mb-2">Shopping Suggestions</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Get personalized recommendations from 23's lookbook to complete your fit. 
                  See what pieces would elevate your style game.
                </p>
              </div>
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="border border-neutral-800 rounded-2xl p-8 bg-neutral-950 mt-8"
            >
              <h2 className="text-2xl font-medium text-white mb-6">How It Works</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-medium text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Build Your Wardrobe</h4>
                    <p className="text-sm text-neutral-400">
                      Select all the clothing items you own from our extensive collection. 
                      Add custom items with photos, organize by category—make it yours!
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-medium text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Get Daily Outfits</h4>
                    <p className="text-sm text-neutral-400">
                      Every morning, we'll generate a unique outfit for you automatically. 
                      Or click "Build Your Own" to manually curate your perfect look. 
                      Save it, and it's locked in for that day!
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-medium text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Track & Explore</h4>
                    <p className="text-sm text-neutral-400">
                      Use the calendar to see what you wore on any day. Regenerate outfits anytime, 
                      get shopping suggestions, and manage your wardrobe—all in one place!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartPlanning}
                className="px-12 py-4 bg-white text-black rounded-full text-lg font-medium uppercase tracking-wider hover:bg-neutral-200 transition-colors"
              >
                Start Your Daily Outfit Planning with 23
              </motion.button>
              <p className="text-xs text-neutral-500 mt-4">
                Say goodbye to outfit indecision. Say hello to effortless style. Let's go! 🚀
              </p>
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-neutral-100">
        <main>
          {/* Back Button */}
          <section className="mx-auto max-w-6xl px-6 pt-8">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate("/hub")}
              className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>←</span> Back to Main
            </motion.button>
          </section>

          {/* Header */}
          <section className="mx-auto max-w-6xl px-6 pt-12 pb-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">
                Outfit Generator 23
              </p>
              <h1 className="text-4xl sm:text-5xl font-medium leading-tight text-neutral-50">
                Your daily style, curated.
                <span className="block">Every day, a new fit.</span>
              </h1>
            </div>
          </section>

          {/* Calendar Navigation */}
          <section className="mx-auto max-w-6xl px-6 pb-8">
            <div className="flex items-center justify-between border border-neutral-800 rounded-2xl p-6 bg-neutral-950">
              <button
                onClick={() => handleDateChange(-1)}
                className="px-4 py-2 border border-neutral-700 rounded-lg hover:border-neutral-300 transition-colors"
              >
                ← Previous
              </button>
              <div className="text-center">
                <p className="text-sm text-neutral-400 uppercase tracking-[0.2em]">
                  {formatDate(currentDate)}
                </p>
                {generatedOutfit && (
                  <p className="text-xs text-green-400 mt-1">✓ Saved</p>
                )}
              </div>
              <button
                onClick={() => handleDateChange(1)}
                className="px-4 py-2 border border-neutral-700 rounded-lg hover:border-neutral-300 transition-colors"
              >
                Next →
              </button>
            </div>
            <p className="text-xs text-neutral-500 text-center mt-2">
              All outfits are saved automatically. Navigate dates to view your past outfits.
            </p>
          </section>

          <AnimatePresence mode="wait">
            {showWardrobePage ? (
              <motion.section
                key="wardrobe-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-6xl px-6 pb-12"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-medium text-neutral-50">My Wardrobe</h2>
                      <p className="text-sm text-neutral-400 mt-2">
                        View, add, and manage all items in your wardrobe ({selectedItems.size} items)
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowAddItem(true);
                          setShowWardrobeManager(true);
                        }}
                        className="px-6 py-2 border border-white bg-white text-black rounded-lg text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
                      >
                        + Add Item
                      </button>
                      <button
                        onClick={() => setShowWardrobePage(false)}
                        className="px-6 py-2 border border-neutral-700 bg-neutral-900 rounded-lg text-sm hover:border-neutral-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Wardrobe Items by Category */}
                  <div className="space-y-8">
                    {Object.entries(WARDROBE_CATEGORIES).map(([category, items]) => {
                      const customCategoryItems = customItems.filter(item => item.category === category);
                      const allCategoryItems = [...items, ...customCategoryItems];
                      const selectedCategoryItems = allCategoryItems.filter(item => selectedItems.has(item.id));
                      
                      if (selectedCategoryItems.length === 0) return null;

                      return (
                        <div key={category} className="border border-neutral-800 rounded-2xl p-6 bg-neutral-950">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-medium text-neutral-300 capitalize">
                              {category} ({selectedCategoryItems.length} items)
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {selectedCategoryItems.map((item) => (
                              <div key={item.id} className="relative group">
                                <div className="aspect-square rounded-lg border border-neutral-800 overflow-hidden bg-neutral-900">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display = "flex";
                                    }}
                                  />
                                  <div className="hidden w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 items-center justify-center">
                                    <span className="text-lg opacity-50">{item.name.charAt(0)}</span>
                                  </div>
                                </div>
                                <div className="mt-2 text-center">
                                  <p className="text-sm text-neutral-300 truncate">{item.name}</p>
                                  {item.isCustom && (
                                    <span className="text-xs text-blue-400">Custom</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    const newSelected = new Set(selectedItems);
                                    newSelected.delete(item.id);
                                    setSelectedItems(newSelected);
                                    if (currentUser) {
                                      setUserData(currentUser.uid, "selectedWardrobe", [...newSelected]);
                                    }
                                    if (item.isCustom) {
                                      handleDeleteItem(item.id);
                                    }
                                  }}
                                  className="absolute top-2 right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
                                  title="Remove from wardrobe"
                                >
                                  <span className="text-white text-sm font-bold">×</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty State */}
                    {selectedItems.size === 0 && (
                      <div className="border border-neutral-800 rounded-2xl p-12 bg-neutral-950 text-center">
                        <div className="text-6xl opacity-50 mb-4">👔</div>
                        <p className="text-neutral-400 mb-4">Your wardrobe is empty</p>
                        <button
                          onClick={() => {
                            setShowAddItem(true);
                            setShowWardrobeManager(true);
                          }}
                          className="px-6 py-3 border border-white bg-white text-black rounded-lg text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
                        >
                          Add Your First Item
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            ) : showWardrobe ? (
              <motion.section
                key="wardrobe"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-6xl px-6 pb-12"
              >
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-medium text-neutral-50">
                      Select Your Wardrobe
                    </h2>
                    <p className="text-sm text-neutral-400">
                      Choose all the items you have in your wardrobe. We'll use these to generate your daily outfits.
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-medium text-neutral-50">
                        Select Your Wardrobe
                      </h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Choose all the items you have. You can add custom items later.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowWardrobeManager(true)}
                      className="px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-lg text-sm hover:border-neutral-300 transition-colors"
                    >
                      Manage Wardrobe
                    </button>
                  </div>

                  {Object.entries(WARDROBE_CATEGORIES).map(([category, items]) => {
                    // Get custom items for this category
                    const customCategoryItems = customItems.filter(item => item.category === category);
                    const allCategoryItems = [...items, ...customCategoryItems];
                    
                    return (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-medium text-neutral-300 capitalize">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allCategoryItems.map((item) => (
                          <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleItemToggle(item.id)}
                            className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                              selectedItems.has(item.id)
                                ? "border-white bg-white/10"
                                : "border-neutral-800 bg-neutral-950 hover:border-neutral-600"
                            }`}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover opacity-80"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 hidden items-center justify-center">
                              <span className="text-2xl opacity-50">
                                {item.name.charAt(0)}
                              </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
                              <p className="text-xs text-white text-center truncate">
                                {item.name}
                              </p>
                            </div>
                            {selectedItems.has(item.id) && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center z-10">
                                <span className="text-black text-xs font-bold">✓</span>
                              </div>
                            )}
                            {item.isCustom && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 rounded text-xs text-white">
                                Custom
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                  })}

                  <div className="pt-8 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        if (selectedItems.size > 0) {
                          setShowWardrobe(false);
                          generateOutfit();
                        } else {
                          alert("Please select at least one item from your wardrobe!");
                        }
                      }}
                      className="px-8 py-3 border border-white bg-white text-black rounded-full text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors font-medium"
                    >
                      Save Wardrobe & Generate Outfit
                    </button>
                    <button
                      onClick={() => {
                        setShowWardrobeManager(true);
                        setShowAddItem(true);
                      }}
                      className="px-8 py-3 border border-neutral-700 bg-neutral-900 rounded-full text-sm uppercase tracking-[0.2em] hover:border-white hover:bg-neutral-800 transition-colors"
                    >
                      + Add Custom Item
                    </button>
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="outfit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-6xl px-6 pb-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Generated Outfit */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-medium text-neutral-50">
                        Today's Outfit
                      </h2>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowWardrobe(true)}
                          className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          Edit Wardrobe
                        </button>
                        <button
                          onClick={() => setShowWardrobePage(true)}
                          className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          My Wardrobe
                        </button>
                      </div>
                    </div>

                    {generatedOutfit ? (
                      <div className="space-y-4 border border-neutral-800 rounded-2xl p-6 bg-neutral-950">
                        {/* Outfit Display */}
                        <div className="aspect-[4/5] bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center overflow-hidden">
                          {generatedOutfit.top && (
                            <img
                              src={generatedOutfit.top.image}
                              alt="Outfit"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          {(!generatedOutfit.top || !generatedOutfit.top.image) && (
                            <div className="text-center space-y-2">
                              <div className="text-6xl opacity-50">👔</div>
                              <p className="text-sm text-neutral-400">Outfit Preview</p>
                            </div>
                          )}
                        </div>

                        {/* Outfit Details */}
                        <div className="space-y-3 pt-4">
                          {generatedOutfit.top && (
                            <div className="flex items-center gap-3 p-3 border border-neutral-800 rounded-lg">
                              <span className="text-sm text-neutral-400">Top:</span>
                              <span className="text-sm text-white">{generatedOutfit.top.name}</span>
                            </div>
                          )}
                          {generatedOutfit.bottom && (
                            <div className="flex items-center gap-3 p-3 border border-neutral-800 rounded-lg">
                              <span className="text-sm text-neutral-400">Bottom:</span>
                              <span className="text-sm text-white">{generatedOutfit.bottom.name}</span>
                            </div>
                          )}
                          {generatedOutfit.outerwear && (
                            <div className="flex items-center gap-3 p-3 border border-neutral-800 rounded-lg">
                              <span className="text-sm text-neutral-400">Outerwear:</span>
                              <span className="text-sm text-white">{generatedOutfit.outerwear.name}</span>
                            </div>
                          )}
                          {generatedOutfit.shoes && (
                            <div className="flex items-center gap-3 p-3 border border-neutral-800 rounded-lg">
                              <span className="text-sm text-neutral-400">Shoes:</span>
                              <span className="text-sm text-white">{generatedOutfit.shoes.name}</span>
                            </div>
                          )}
                          {generatedOutfit.accessories.length > 0 && (
                            <div className="flex items-center gap-3 p-3 border border-neutral-800 rounded-lg">
                              <span className="text-sm text-neutral-400">Accessories:</span>
                              <span className="text-sm text-white">
                                {generatedOutfit.accessories.map(a => a.name).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              generateOutfit();
                              setManualMode(false);
                            }}
                            className="flex-1 px-6 py-3 border border-neutral-700 bg-neutral-900 rounded-full text-sm uppercase tracking-[0.2em] hover:border-white hover:bg-neutral-800 transition-colors"
                          >
                            Auto Generate New
                          </button>
                          <button
                            onClick={() => {
                              if (!manualMode) {
                                // Initialize outfit with current outfit or empty
                                if (!generatedOutfit) {
                                  setGeneratedOutfit({
                                    top: null,
                                    bottom: null,
                                    outerwear: null,
                                    shoes: null,
                                    accessories: [],
                                  });
                                } else {
                                  // Start with current outfit so user can modify it
                                  setGeneratedOutfit({
                                    top: generatedOutfit.top || null,
                                    bottom: generatedOutfit.bottom || null,
                                    outerwear: generatedOutfit.outerwear || null,
                                    shoes: generatedOutfit.shoes || null,
                                    accessories: generatedOutfit.accessories ? [...generatedOutfit.accessories] : [],
                                  });
                                }
                              }
                              setManualMode(!manualMode);
                            }}
                            className="flex-1 px-6 py-3 border border-neutral-700 bg-neutral-900 rounded-full text-sm uppercase tracking-[0.2em] hover:border-white hover:bg-neutral-800 transition-colors"
                          >
                            {manualMode ? "Cancel" : "Build Your Own"}
                          </button>
                        </div>
                        {manualMode && (
                          <>
                            <button
                              onClick={saveManualOutfit}
                              className="w-full px-6 py-3 border border-white bg-white text-black rounded-full text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
                            >
                              Save Outfit
                            </button>
                            
                            {/* Manual Outfit Builder */}
                            <div className="mt-6 space-y-6 pt-6 border-t border-neutral-800">
                              <h3 className="text-lg font-medium text-neutral-50">Build Your Outfit</h3>
                              <p className="text-sm text-neutral-400">Select items from your wardrobe to create your outfit</p>
                              
                              {Object.entries(WARDROBE_CATEGORIES).map(([category, items]) => {
                                // Get custom items for this category
                                const customCategoryItems = customItems.filter(item => item.category === category);
                                // Combine default and custom items, filter by selected
                                const allCategoryItems = [...items, ...customCategoryItems];
                                const availableItems = allCategoryItems.filter(item => selectedItems.has(item.id));
                                if (availableItems.length === 0) return null;
                                
                                const isSelected = (item) => {
                                  if (category === "accessories") {
                                    return generatedOutfit?.accessories?.some(a => a && a.id === item.id) || false;
                                  } else {
                                    const currentItem = generatedOutfit?.[category];
                                    return currentItem && currentItem.id === item.id;
                                  }
                                };
                                
                                return (
                                  <div key={category} className="space-y-3">
                                    <h4 className="text-sm font-medium text-neutral-300 capitalize">
                                      {category}
                                    </h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                      {availableItems.map((item) => {
                                        const selected = isSelected(item);
                                        return (
                                        <motion.button
                                          key={item.id}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleManualSelect(category === "accessories" ? "accessories" : category, item);
                                          }}
                                          className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                                            selected
                                              ? "border-white bg-white/10"
                                              : "border-neutral-700 bg-neutral-900 hover:border-neutral-500"
                                          }`}
                                        >
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover opacity-80"
                                            onError={(e) => {
                                              e.target.style.display = "none";
                                              e.target.nextSibling.style.display = "flex";
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 hidden items-center justify-center">
                                            <span className="text-xs opacity-50">{item.name.charAt(0)}</span>
                                          </div>
                                          {selected && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center z-10">
                                              <span className="text-black text-xs font-bold">✓</span>
                                            </div>
                                          )}
                                          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1">
                                            <p className="text-[10px] text-white text-center truncate">{item.name}</p>
                                          </div>
                                        </motion.button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="border border-neutral-800 rounded-2xl p-12 bg-neutral-950 text-center">
                        <p className="text-neutral-400 mb-4">No outfit generated yet</p>
                        <button
                          onClick={generateOutfit}
                          className="px-6 py-3 border border-neutral-700 bg-neutral-900 rounded-full text-sm uppercase tracking-[0.2em] hover:border-white hover:bg-neutral-800 transition-colors"
                        >
                          Generate Outfit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Shopping Recommendations */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-medium text-neutral-50">
                      Shop 23 to Complete Your Fit
                    </h2>
                    <div className="space-y-4">
                      {getRecommendations().map((item) => (
                        <motion.a
                          key={item.id}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          className="block border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 hover:border-neutral-300 transition-colors"
                        >
                          <div className="aspect-[4/5] relative overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <p className="text-sm font-medium text-white">{item.name}</p>
                              <p className="text-xs text-neutral-300 mt-1">Shop Now →</p>
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Wardrobe Manager Modal (for adding items) */}
          {showWardrobeManager && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={() => {
              setShowWardrobeManager(false);
              setShowAddItem(false);
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-medium text-neutral-50">Manage Your Wardrobe</h2>
                  <button
                    onClick={() => {
                      setShowWardrobeManager(false);
                      setShowAddItem(false);
                    }}
                    className="text-neutral-400 hover:text-white text-xl"
                  >
                    ✕
                  </button>
                </div>

                {!showAddItem ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-400">View and manage all items in your wardrobe</p>
                      <button
                        onClick={() => setShowAddItem(true)}
                        className="px-4 py-2 border border-white bg-white text-black rounded-lg text-sm hover:bg-neutral-100 transition-colors"
                      >
                        + Add New Item
                      </button>
                    </div>

                    {/* Show all selected items */}
                    <div className="space-y-6">
                      {Object.entries(WARDROBE_CATEGORIES).map(([category, items]) => {
                        const customCategoryItems = customItems.filter(item => item.category === category);
                        const allCategoryItems = [...items, ...customCategoryItems];
                        const selectedCategoryItems = allCategoryItems.filter(item => selectedItems.has(item.id));
                        
                        if (selectedCategoryItems.length === 0) return null;

                        return (
                          <div key={category} className="space-y-3">
                            <h3 className="text-lg font-medium text-neutral-300 capitalize">
                              {category} ({selectedCategoryItems.length})
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                              {selectedCategoryItems.map((item) => (
                                <div key={item.id} className="relative group">
                                  <div className="aspect-square rounded-lg border border-neutral-800 overflow-hidden bg-neutral-900">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display = "flex";
                                      }}
                                    />
                                    <div className="hidden w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 items-center justify-center">
                                      <span className="text-xs opacity-50">{item.name.charAt(0)}</span>
                                    </div>
                                  </div>
                                  <div className="mt-1 text-center">
                                    <p className="text-xs text-neutral-300 truncate">{item.name}</p>
                                  </div>
                                  {item.isCustom && (
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <span className="text-white text-xs">×</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-medium text-neutral-50">Add New Item</h3>
                      <button
                        onClick={() => setShowAddItem(false)}
                        className="text-neutral-400 hover:text-white"
                      >
                        ← Back
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-neutral-400 mb-2">Item Name *</label>
                        <input
                          type="text"
                          value={newItem.name}
                          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white focus:border-white focus:outline-none"
                          placeholder="e.g., Red Hoodie"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-neutral-400 mb-2">Category *</label>
                        <select
                          value={newItem.category}
                          onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white focus:border-white focus:outline-none"
                        >
                          <option value="tops">Tops</option>
                          <option value="bottoms">Bottoms</option>
                          <option value="outerwear">Outerwear</option>
                          <option value="shoes">Shoes</option>
                          <option value="accessories">Accessories</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-neutral-400 mb-2">Upload Image *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-neutral-400 mb-2">Or Enter Image URL</label>
                        <input
                          type="url"
                          value={newItem.imageUrl}
                          onChange={(e) => setNewItem(prev => ({ ...prev, imageUrl: e.target.value, image: null }))}
                          className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white focus:border-white focus:outline-none"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      {newItem.image && (
                        <div className="aspect-square max-w-xs border border-neutral-800 rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(newItem.image)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {newItem.imageUrl && !newItem.image && (
                        <div className="aspect-square max-w-xs border border-neutral-800 rounded-lg overflow-hidden">
                          <img
                            src={newItem.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={handleAddCustomItem}
                          className="flex-1 px-6 py-3 border border-white bg-white text-black rounded-lg text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
                        >
                          Add to Wardrobe
                        </button>
                        <button
                          onClick={() => {
                            setNewItem({ name: "", category: "tops", image: null, imageUrl: "" });
                            setShowAddItem(false);
                          }}
                          className="px-6 py-3 border border-neutral-700 bg-neutral-900 rounded-lg text-sm hover:border-neutral-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}

export default OutfitGenerator;
