import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import PageTransition from "../components/PageTransition.jsx";

function Hub() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-12"
        >
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <button
                onClick={handleLogout}
                className="text-xs text-neutral-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                Logout
              </button>
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
              Welcome to 23
            </p>
            <h1 className="text-4xl font-medium text-white sm:text-5xl">
              Choose your path
            </h1>
            {currentUser && (
              <p className="text-sm text-neutral-500">
                {currentUser.displayName || currentUser.email}
              </p>
            )}
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-neutral-400">
              Explore our portfolio, browse the lookbook, generate daily outfits, or shop the collection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {/* Portfolio Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation("/portfolio")}
              className="group relative flex flex-col items-center gap-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-900"
            >
              <div className="text-4xl">👥</div>
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-white">Portfolio</h2>
                <p className="text-xs text-neutral-400">
                  Meet the team behind 23
                </p>
              </div>
            </motion.button>

            {/* Lookbook Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation("/lookbook")}
              className="group relative flex flex-col items-center gap-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-900"
            >
              <div className="text-4xl">📸</div>
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-white">Lookbook</h2>
                <p className="text-xs text-neutral-400">
                  Explore our visual collection
                </p>
              </div>
            </motion.button>

            {/* Outfit Generator Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation("/outfit-generator")}
              className="group relative flex flex-col items-center gap-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-900"
            >
              <div className="text-4xl">📅</div>
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-white">Outfit Generator</h2>
                <p className="text-xs text-neutral-400">
                  Get daily outfit suggestions
                </p>
              </div>
            </motion.button>

            {/* Food Generator Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation("/food-generator")}
              className="group relative flex flex-col items-center gap-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-900"
            >
              <div className="text-4xl">🍽️</div>
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-white">Food Planner</h2>
                <p className="text-xs text-neutral-400">
                  Daily balanced meal plans
                </p>
              </div>
            </motion.button>

            {/* Slum Book Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation("/slumbook")}
              className="group relative flex flex-col items-center gap-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-900"
            >
              <div className="text-4xl">📖</div>
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-white">Slum Book</h2>
                <p className="text-xs text-neutral-400">
                  Create your digital identity
                </p>
              </div>
            </motion.button>

            {/* Shopping Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open("https://catlog.shop", "_blank")}
              className="group relative flex flex-col items-center gap-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-900"
            >
              <div className="text-4xl">🛍️</div>
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-white">Shopping</h2>
                <p className="text-xs text-neutral-400">
                  Browse the store catalog
                </p>
              </div>
            </motion.button>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}

export default Hub;
