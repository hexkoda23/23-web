import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { getUserData, setUserData } from "../utils/userStorage";
import PageTransition from "../components/PageTransition.jsx";
import { FOOD_CATEGORIES } from "../data/foodItems.js";

function FoodGenerator() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedFoods, setSelectedFoods] = useState(new Set());
  const [customFoods, setCustomFoods] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [showFoodStore, setShowFoodStore] = useState(true);
  const [showFoodStorePage, setShowFoodStorePage] = useState(false);
  const [showFoodManager, setShowFoodManager] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [dailyMeals, setDailyMeals] = useState({});
  const [showIntro, setShowIntro] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  
  // New food form state
  const [newFood, setNewFood] = useState({
    name: "",
    category: "breakfast",
    image: null,
    imageUrl: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    if (!currentUser) return;
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    const userId = currentUser.uid;
    
    // Check if intro has been shown before
    const introShown = getUserData(userId, "foodIntroShown", false);
    
    // Check last visit date
    const lastVisit = getUserData(userId, "foodLastVisit", null);
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
    setUserData(userId, "foodLastVisit", now.toISOString());
    
    // Load custom foods (user-specific)
    const savedCustom = getUserData(userId, "customFoodItems", []);
    if (savedCustom && savedCustom.length > 0) {
      setCustomFoods(savedCustom);
    }
    
    // Load saved food store selection (user-specific)
    const saved = getUserData(userId, "selectedFoodStore", []);
    if (saved && saved.length > 0) {
      const savedSet = new Set(saved);
      setSelectedFoods(savedSet);
      setShowFoodStore(false);
      
      // Load saved daily meals (user-specific)
      const savedMeals = getUserData(userId, "dailyMeals", {});
      const dateKey = new Date().toDateString();
      
      if (Object.keys(savedMeals).length > 0) {
        setDailyMeals(savedMeals);
        
        // Load today's meal if it exists
        if (savedMeals[dateKey]) {
          setGeneratedMeal(savedMeals[dateKey]);
        } else {
          // Auto-generate meal for today if not exists
          generateMealAuto(new Date(), savedMeals);
        }
      } else {
        // Auto-generate meal for first-time user
        generateMealAuto(new Date(), {});
      }
    } else {
      // First time user - must select food store
      setShowFoodStore(true);
    }
  }, [currentUser]);
  
  const handleStartPlanning = () => {
    if (currentUser) {
      const userId = currentUser.uid;
      setUserData(userId, "foodIntroShown", true);
    }
    setShowIntro(false);
    setShowWelcomeBack(false);
  };

  const generateMealAuto = (date, mealsData, forceNew = false) => {
    const dateKey = date.toDateString();
    
    // Get all available foods (default + custom) that are selected
    const allItems = [];
    Object.values(FOOD_CATEGORIES).forEach(category => {
      category.forEach(item => {
        if (selectedFoods.has(item.id)) {
          allItems.push(item);
        }
      });
    });
    
    // Add custom foods that are selected
    customFoods.forEach(item => {
      if (selectedFoods.has(item.id)) {
        allItems.push(item);
      }
    });

    if (allItems.length === 0) {
      alert("Please select some foods in your food store first!");
      setShowFoodStore(true);
      return;
    }

    // Generate meal with date-based seed for consistency, or random seed for regeneration
    const seed = forceNew ? Math.random() * 1000000 + Date.now() : date.getTime();
    const random = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Select items for each meal type
    const meal = {
      breakfast: null,
      lunch: null,
      dinner: null,
      fruits: []
    };

    const breakfastItems = allItems.filter(item => item.category === "breakfast");
    const lunchItems = allItems.filter(item => item.category === "lunch");
    const dinnerItems = allItems.filter(item => item.category === "dinner");
    const fruitItems = allItems.filter(item => item.category === "fruits");

    if (breakfastItems.length > 0) {
      meal.breakfast = breakfastItems[Math.floor(random(seed) * breakfastItems.length)];
    }
    if (lunchItems.length > 0) {
      meal.lunch = lunchItems[Math.floor(random(seed + 1) * lunchItems.length)];
    }
    if (dinnerItems.length > 0) {
      meal.dinner = dinnerItems[Math.floor(random(seed + 2) * dinnerItems.length)];
    }
    if (fruitItems.length > 0) {
      // Select 1-2 fruits (always different when regenerating or changing dates)
      const fruitCount = Math.min(2, fruitItems.length);
      meal.fruits = []; // Clear fruits array to ensure fresh selection
      
      // Use different seed offsets for fruits to ensure variety
      const fruitSeedOffset = forceNew ? Math.random() * 1000 : date.getDate() * 100; // Change daily based on date
      
      for (let i = 0; i < fruitCount; i++) {
        const fruitIndex = Math.floor(random(seed + fruitSeedOffset + i * 100) * fruitItems.length);
        const fruit = fruitItems[fruitIndex];
        if (fruit && !meal.fruits.find(f => f && f.id === fruit.id)) {
          meal.fruits.push(fruit);
        }
      }
      
      // If we didn't get enough fruits, try again with different offsets
      if (meal.fruits.length < fruitCount && fruitItems.length > meal.fruits.length) {
        const remainingFruits = fruitItems.filter(f => !meal.fruits.find(mf => mf && mf.id === f.id));
        while (meal.fruits.length < fruitCount && remainingFruits.length > 0) {
          const randomIndex = Math.floor(random(seed + fruitSeedOffset + meal.fruits.length * 50) * remainingFruits.length);
          meal.fruits.push(remainingFruits[randomIndex]);
          remainingFruits.splice(randomIndex, 1);
        }
      }
    }

    // Save meal for this date (user-specific)
    const newDailyMeals = { ...mealsData, [dateKey]: meal };
    setDailyMeals(newDailyMeals);
    if (currentUser) {
      setUserData(currentUser.uid, "dailyMeals", newDailyMeals);
    }
    setGeneratedMeal(meal);
  };

  const generateMeal = () => {
    const dateKey = currentDate.toDateString();
    const mealsData = { ...dailyMeals };
    generateMealAuto(currentDate, mealsData, true); // forceNew = true for regeneration
  };

  const handleFoodToggle = (foodId) => {
    const newSelected = new Set(selectedFoods);
    if (newSelected.has(foodId)) {
      newSelected.delete(foodId);
    } else {
      newSelected.add(foodId);
    }
    setSelectedFoods(newSelected);
    if (currentUser) {
      setUserData(currentUser.uid, "selectedFoodStore", [...newSelected]);
    }
  };

  const handleAddCustomFood = async () => {
    if (!newFood.name || (!newFood.image && !newFood.imageUrl)) {
      alert("Please provide a name and image for your food!");
      return;
    }

    let imageData = newFood.imageUrl;
    
    // If image file is provided, convert to base64
    if (newFood.image) {
      imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(newFood.image);
      });
    }

    const customFood = {
      id: `custom_food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newFood.name,
      category: newFood.category,
      image: imageData,
      calories: parseInt(newFood.calories) || 0,
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fat: parseFloat(newFood.fat) || 0,
      isCustom: true
    };

    const updatedCustom = [...customFoods, customFood];
    setCustomFoods(updatedCustom);
    if (currentUser) {
      setUserData(currentUser.uid, "customFoodItems", updatedCustom);
    }

    // Automatically select the new food
    const newSelected = new Set(selectedFoods);
    newSelected.add(customFood.id);
    setSelectedFoods(newSelected);
    if (currentUser) {
      setUserData(currentUser.uid, "selectedFoodStore", [...newSelected]);
    }

    // Reset form
    setNewFood({ name: "", category: "breakfast", image: null, imageUrl: "", calories: 0, protein: 0, carbs: 0, fat: 0 });
    setShowAddFood(false);
    alert("Food added to your food store and selected!");
  };

  const handleDeleteFood = (foodId) => {
    if (confirm("Are you sure you want to remove this food from your store?")) {
      // Remove from custom foods if it's custom
      const updatedCustom = customFoods.filter(food => food.id !== foodId);
      setCustomFoods(updatedCustom);
      if (currentUser) {
        setUserData(currentUser.uid, "customFoodItems", updatedCustom);
      }

      // Remove from selected foods
      const newSelected = new Set(selectedFoods);
      newSelected.delete(foodId);
      setSelectedFoods(newSelected);
      if (currentUser) {
        setUserData(currentUser.uid, "selectedFoodStore", [...newSelected]);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFood(prev => ({ ...prev, image: file, imageUrl: "" }));
    }
  };

  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
    
    const dateKey = newDate.toDateString();
    
    // Load fresh data from storage to ensure we have all saved meals
    if (currentUser) {
      const savedMeals = getUserData(currentUser.uid, "dailyMeals", {});
      setDailyMeals(savedMeals);
      
      if (savedMeals[dateKey]) {
        // Load existing meal for this date
        setGeneratedMeal(savedMeals[dateKey]);
      } else {
        // Auto-generate for new date if food store is selected
        if (selectedFoods.size > 0) {
          generateMealAuto(newDate, savedMeals, false);
        } else {
          setGeneratedMeal(null);
        }
      }
    } else {
      // Fallback to state if no user
      const mealsData = { ...dailyMeals };
      if (mealsData[dateKey]) {
        setGeneratedMeal(mealsData[dateKey]);
      } else {
        if (selectedFoods.size > 0) {
          generateMealAuto(newDate, mealsData, false);
        } else {
          setGeneratedMeal(null);
        }
      }
    }
  };

  const calculateTotalNutrition = () => {
    if (!generatedMeal) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    if (generatedMeal.breakfast) {
      total.calories += generatedMeal.breakfast.calories || 0;
      total.protein += generatedMeal.breakfast.protein || 0;
      total.carbs += generatedMeal.breakfast.carbs || 0;
      total.fat += generatedMeal.breakfast.fat || 0;
    }
    if (generatedMeal.lunch) {
      total.calories += generatedMeal.lunch.calories || 0;
      total.protein += generatedMeal.lunch.protein || 0;
      total.carbs += generatedMeal.lunch.carbs || 0;
      total.fat += generatedMeal.lunch.fat || 0;
    }
    if (generatedMeal.dinner) {
      total.calories += generatedMeal.dinner.calories || 0;
      total.protein += generatedMeal.dinner.protein || 0;
      total.carbs += generatedMeal.dinner.carbs || 0;
      total.fat += generatedMeal.dinner.fat || 0;
    }
    if (generatedMeal.fruits && generatedMeal.fruits.length > 0) {
      generatedMeal.fruits.forEach(fruit => {
        if (fruit) {
          total.calories += fruit.calories || 0;
          total.protein += fruit.protein || 0;
          total.carbs += fruit.carbs || 0;
          total.fat += fruit.fat || 0;
        }
      });
    }
    
    return total;
  };

  const handleSaveFoodStore = () => {
    if (selectedFoods.size === 0) {
      alert("Please select at least one food item!");
      return;
    }
    // Save food store selection (user-specific)
    if (currentUser) {
      setUserData(currentUser.uid, "selectedFoodStore", [...selectedFoods]);
    }
    setShowFoodStore(false);
    generateMeal();
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
              It's been a while! We've missed you. Ready to get back to planning your daily meals? 
              Your food store and meal history are all saved and waiting for you.
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
                🍎
              </motion.div>
              <h1 className="text-5xl sm:text-6xl font-medium text-white leading-tight">
                Health is Wealth,
                <br />
                <span className="text-neutral-400">and We Care About Both</span>
              </h1>
              <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                At 23, we don't just dress you up—we fuel you up! Because looking good is only half the battle. 
                Feeling good? That's where the real magic happens. ✨
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
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-white mb-2">Daily Meal Plans</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Get personalized breakfast, lunch, dinner, and fruit suggestions every single day. 
                  No more "what should I eat?" moments.
                </p>
              </div>
              
              <div className="border border-neutral-800 rounded-2xl p-6 bg-neutral-950 hover:border-neutral-600 transition-colors">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-lg font-medium text-white mb-2">Balanced Nutrition</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  We track calories, protein, carbs, and fats to ensure you're getting a well-rounded diet 
                  that keeps you energized and healthy.
                </p>
              </div>
              
              <div className="border border-neutral-800 rounded-2xl p-6 bg-neutral-950 hover:border-neutral-600 transition-colors">
                <div className="text-4xl mb-4">🛒</div>
                <h3 className="text-lg font-medium text-white mb-2">Your Food Store</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Build your personal food inventory from what you have easy access to. 
                  Add custom items, manage your selection—it's all yours.
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
                    <h4 className="text-white font-medium mb-1">Select Your Food Store</h4>
                    <p className="text-sm text-neutral-400">
                      Choose from our curated list of foods and fruits that you have easy access to. 
                      You can add your own custom items too!
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-medium text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Get Daily Meal Plans</h4>
                    <p className="text-sm text-neutral-400">
                      Every day, we'll generate a balanced meal plan (breakfast, lunch, dinner + fruits) 
                      based on what's in your food store. Click "Regenerate Meal" anytime for variety!
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-medium text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Track & Navigate</h4>
                    <p className="text-sm text-neutral-400">
                      Use the calendar to view past meals, see your nutrition breakdown, and manage your food store. 
                      Your meal history is saved automatically!
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
                Start Your Daily Food Planning with 23
              </motion.button>
              <p className="text-xs text-neutral-500 mt-4">
                Ready to fuel your body as well as you style your outfit? Let's go! 🚀
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
          {/* Header */}
          <section className="mx-auto max-w-6xl px-6 pt-12 pb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-medium text-neutral-50">Daily Meal Planner</h1>
                <p className="text-sm text-neutral-400 mt-2">
                  Get balanced daily meal suggestions based on your food store
                </p>
              </div>
              <button
                onClick={() => navigate("/hub")}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                ← Back to Main
              </button>
            </div>
          </section>

          {/* Date Navigation */}
          <section className="mx-auto max-w-6xl px-6 pb-6">
            <div className="flex items-center justify-between border border-neutral-800 rounded-xl p-4 bg-neutral-950">
              <button
                onClick={() => handleDateChange(-1)}
                className="px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-lg text-sm hover:border-neutral-300 transition-colors"
              >
                ← Previous
              </button>
              <div className="text-center">
                <p className="text-sm text-neutral-400">Selected Date</p>
                <p className="text-lg font-medium text-white">
                  {currentDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                {generatedMeal && (
                  <p className="text-xs text-green-400 mt-1">✓ Saved</p>
                )}
              </div>
              <button
                onClick={() => handleDateChange(1)}
                className="px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-lg text-sm hover:border-neutral-300 transition-colors"
              >
                Next →
              </button>
            </div>
            <p className="text-xs text-neutral-500 text-center mt-2">
              All meals are saved automatically. Navigate dates to view your past meal plans.
            </p>
          </section>

          <AnimatePresence mode="wait">
            {showFoodStorePage ? (
              <motion.section
                key="food-store-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-6xl px-6 pb-12"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-medium text-neutral-50">My Food Store</h2>
                      <p className="text-sm text-neutral-400 mt-2">
                        View, add, and manage all foods in your store ({selectedFoods.size} items)
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowAddFood(true);
                          setShowFoodManager(true);
                        }}
                        className="px-6 py-2 border border-white bg-white text-black rounded-lg text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
                      >
                        + Add Food
                      </button>
                      <button
                        onClick={() => setShowFoodStorePage(false)}
                        className="px-6 py-2 border border-neutral-700 bg-neutral-900 rounded-lg text-sm hover:border-neutral-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Food Items by Category */}
                  <div className="space-y-8">
                    {Object.entries(FOOD_CATEGORIES).map(([category, foods]) => {
                      const customCategoryFoods = customFoods.filter(food => food.category === category);
                      const allCategoryFoods = [...foods, ...customCategoryFoods];
                      const selectedCategoryFoods = allCategoryFoods.filter(food => selectedFoods.has(food.id));
                      
                      if (selectedCategoryFoods.length === 0) return null;

                      return (
                        <div key={category} className="border border-neutral-800 rounded-2xl p-6 bg-neutral-950">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-medium text-neutral-300 capitalize">
                              {category} ({selectedCategoryFoods.length} items)
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {selectedCategoryFoods.map((food) => (
                              <div key={food.id} className="relative group">
                                <div className="aspect-square rounded-lg border border-neutral-800 overflow-hidden bg-neutral-900">
                                  <img
                                    src={food.image}
                                    alt={food.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display = "flex";
                                    }}
                                  />
                                  <div className="hidden w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 items-center justify-center">
                                    <span className="text-lg opacity-50">{food.name.charAt(0)}</span>
                                  </div>
                                </div>
                                <div className="mt-2 text-center">
                                  <p className="text-sm text-neutral-300 truncate">{food.name}</p>
                                  {food.isCustom && (
                                    <span className="text-xs text-blue-400">Custom</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    const newSelected = new Set(selectedFoods);
                                    newSelected.delete(food.id);
                                    setSelectedFoods(newSelected);
                                    if (currentUser) {
                                      setUserData(currentUser.uid, "selectedFoodStore", [...newSelected]);
                                    }
                                    if (food.isCustom) {
                                      handleDeleteFood(food.id);
                                    }
                                  }}
                                  className="absolute top-2 right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
                                  title="Remove from food store"
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
                    {selectedFoods.size === 0 && (
                      <div className="border border-neutral-800 rounded-2xl p-12 bg-neutral-950 text-center">
                        <div className="text-6xl opacity-50 mb-4">🍽️</div>
                        <p className="text-neutral-400 mb-4">Your food store is empty</p>
                        <button
                          onClick={() => {
                            setShowAddFood(true);
                            setShowFoodManager(true);
                          }}
                          className="px-6 py-3 border border-white bg-white text-black rounded-lg text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
                        >
                          Add Your First Food
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            ) : showFoodStore ? (
              <motion.section
                key="food-store"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-6xl px-6 pb-12"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-medium text-neutral-50">
                        Select Your Food Store
                      </h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Choose all the foods you have easy access to. We'll use these to create your daily balanced meals.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowFoodManager(true)}
                      className="px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-lg text-sm hover:border-neutral-300 transition-colors"
                    >
                      Add Custom Food
                    </button>
                  </div>

                  {Object.entries(FOOD_CATEGORIES).map(([category, foods]) => {
                    const customCategoryFoods = customFoods.filter(food => food.category === category);
                    const allCategoryFoods = [...foods, ...customCategoryFoods];
                    
                    return (
                      <div key={category} className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-300 capitalize">
                          {category}
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                          {allCategoryFoods.map((food) => {
                            const isSelected = selectedFoods.has(food.id);
                            return (
                              <motion.button
                                key={food.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleFoodToggle(food.id)}
                                className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                                  isSelected
                                    ? "border-white bg-white/10"
                                    : "border-neutral-700 bg-neutral-900 hover:border-neutral-500"
                                }`}
                              >
                                <img
                                  src={food.image}
                                  alt={food.name}
                                  className="w-full h-full object-cover opacity-80"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 hidden items-center justify-center">
                                  <span className="text-xs opacity-50">{food.name.charAt(0)}</span>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center z-10">
                                    <span className="text-black text-xs font-bold">✓</span>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1">
                                  <p className="text-[10px] text-white text-center truncate">{food.name}</p>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex justify-center pt-6">
                    <button
                      onClick={handleSaveFoodStore}
                      className="px-8 py-3 border border-white bg-white text-black rounded-full text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
                    >
                      Save Food Store & Generate Meal
                    </button>
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="meal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-6xl px-6 pb-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Meal Display */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-medium text-neutral-50">
                        Today's Balanced Meal Plan
                      </h2>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowFoodStore(true)}
                          className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          Edit Food Store
                        </button>
                        <button
                          onClick={() => setShowFoodStorePage(true)}
                          className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          My Food Store
                        </button>
                      </div>
                    </div>

                    {generatedMeal ? (
                      <div className="space-y-6">
                        {/* Breakfast */}
                        {generatedMeal.breakfast && (
                          <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-950">
                            <h3 className="text-lg font-medium text-neutral-300 mb-4">Breakfast</h3>
                            <div className="flex gap-4">
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                                <img
                                  src={generatedMeal.breakfast.image}
                                  alt={generatedMeal.breakfast.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">{generatedMeal.breakfast.name}</p>
                                <div className="mt-2 flex gap-4 text-xs text-neutral-400">
                                  <span>{generatedMeal.breakfast.calories || 0} cal</span>
                                  <span>{generatedMeal.breakfast.protein || 0}g protein</span>
                                  <span>{generatedMeal.breakfast.carbs || 0}g carbs</span>
                                  <span>{generatedMeal.breakfast.fat || 0}g fat</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Lunch */}
                        {generatedMeal.lunch && (
                          <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-950">
                            <h3 className="text-lg font-medium text-neutral-300 mb-4">Lunch</h3>
                            <div className="flex gap-4">
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                                <img
                                  src={generatedMeal.lunch.image}
                                  alt={generatedMeal.lunch.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">{generatedMeal.lunch.name}</p>
                                <div className="mt-2 flex gap-4 text-xs text-neutral-400">
                                  <span>{generatedMeal.lunch.calories || 0} cal</span>
                                  <span>{generatedMeal.lunch.protein || 0}g protein</span>
                                  <span>{generatedMeal.lunch.carbs || 0}g carbs</span>
                                  <span>{generatedMeal.lunch.fat || 0}g fat</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Dinner */}
                        {generatedMeal.dinner && (
                          <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-950">
                            <h3 className="text-lg font-medium text-neutral-300 mb-4">Dinner</h3>
                            <div className="flex gap-4">
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                                <img
                                  src={generatedMeal.dinner.image}
                                  alt={generatedMeal.dinner.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">{generatedMeal.dinner.name}</p>
                                <div className="mt-2 flex gap-4 text-xs text-neutral-400">
                                  <span>{generatedMeal.dinner.calories || 0} cal</span>
                                  <span>{generatedMeal.dinner.protein || 0}g protein</span>
                                  <span>{generatedMeal.dinner.carbs || 0}g carbs</span>
                                  <span>{generatedMeal.dinner.fat || 0}g fat</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Fruits */}
                        {generatedMeal.fruits && generatedMeal.fruits.length > 0 && (
                          <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-950">
                            <h3 className="text-lg font-medium text-neutral-300 mb-4">Fruits</h3>
                            <div className="space-y-3">
                              {generatedMeal.fruits.map((fruit, idx) => (
                                fruit && (
                                  <div key={fruit.id || idx} className="flex gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                                      <img
                                        src={fruit.image}
                                        alt={fruit.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-white font-medium">{fruit.name}</p>
                                      <div className="mt-1 flex gap-4 text-xs text-neutral-400">
                                        <span>{fruit.calories || 0} cal</span>
                                        <span>{fruit.protein || 0}g protein</span>
                                        <span>{fruit.carbs || 0}g carbs</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={generateMeal}
                            className="flex-1 px-6 py-3 border border-neutral-700 bg-neutral-900 rounded-full text-sm uppercase tracking-[0.2em] hover:border-white hover:bg-neutral-800 transition-colors"
                          >
                            Regenerate Meal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-neutral-800 rounded-2xl p-12 bg-neutral-950 text-center">
                        <p className="text-neutral-400 mb-4">No meal generated yet</p>
                        <button
                          onClick={generateMeal}
                          className="px-6 py-3 border border-neutral-700 bg-neutral-900 rounded-full text-sm uppercase tracking-[0.2em] hover:border-white hover:bg-neutral-800 transition-colors"
                        >
                          Generate Meal
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Nutrition Summary */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-medium text-neutral-50">
                      Daily Nutrition Summary
                    </h2>
                    {generatedMeal && (
                      <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-950 space-y-4">
                        {(() => {
                          const nutrition = calculateTotalNutrition();
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-neutral-400">Total Calories</span>
                                <span className="text-2xl font-medium text-white">{nutrition.calories}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-neutral-400">Protein</span>
                                <span className="text-xl font-medium text-white">{nutrition.protein.toFixed(1)}g</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-neutral-400">Carbohydrates</span>
                                <span className="text-xl font-medium text-white">{nutrition.carbs.toFixed(1)}g</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-neutral-400">Fat</span>
                                <span className="text-xl font-medium text-white">{nutrition.fat.toFixed(1)}g</span>
                              </div>
                              <div className="pt-4 border-t border-neutral-800">
                                <p className="text-xs text-neutral-500">
                                  This is a balanced daily meal plan based on your selected food store.
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Food Manager Modal (for adding custom foods) */}
          {showFoodManager && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-medium text-neutral-50">
                    {showAddFood ? "Add Custom Food" : "Manage Food Store"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowFoodManager(false);
                      setShowAddFood(false);
                    }}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {showAddFood ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Food Name
                      </label>
                      <input
                        type="text"
                        value={newFood.name}
                        onChange={(e) => setNewFood(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Homemade Pasta"
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Category
                      </label>
                      <select
                        value={newFood.category}
                        onChange={(e) => setNewFood(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-300"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="fruits">Fruits</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Image URL (or upload file)
                      </label>
                      <input
                        type="text"
                        value={newFood.imageUrl}
                        onChange={(e) => setNewFood(prev => ({ ...prev, imageUrl: e.target.value, image: null }))}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-300 mb-2"
                      />
                      <p className="text-xs text-neutral-500 mb-2">OR</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Calories
                        </label>
                        <input
                          type="number"
                          value={newFood.calories}
                          onChange={(e) => setNewFood(prev => ({ ...prev, calories: e.target.value }))}
                          placeholder="0"
                          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={newFood.protein}
                          onChange={(e) => setNewFood(prev => ({ ...prev, protein: e.target.value }))}
                          placeholder="0"
                          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={newFood.carbs}
                          onChange={(e) => setNewFood(prev => ({ ...prev, carbs: e.target.value }))}
                          placeholder="0"
                          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Fat (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={newFood.fat}
                          onChange={(e) => setNewFood(prev => ({ ...prev, fat: e.target.value }))}
                          placeholder="0"
                          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-300"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAddCustomFood}
                        className="flex-1 px-6 py-3 border border-white bg-white text-black rounded-lg text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
                      >
                        Add Food
                      </button>
                      <button
                        onClick={() => {
                          setShowAddFood(false);
                        }}
                        className="px-6 py-3 border border-neutral-700 bg-neutral-900 rounded-lg text-sm hover:border-neutral-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <button
                      onClick={() => setShowAddFood(true)}
                      className="px-6 py-3 border border-white bg-white text-black rounded-lg text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
                    >
                      Add Custom Food
                    </button>
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

export default FoodGenerator;
