import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition.jsx";
import { MEMBERS } from "../data/members.js";

function Portfolio() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleMemberClick = (memberId) => {
    navigate(`/portfolio/${memberId}`);
  };

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

          {/* Intro */}
          <section className="mx-auto max-w-6xl px-6 pt-12 pb-24">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">
              Portfolio 23 — The Team
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl sm:text-5xl font-medium leading-tight text-neutral-50">
              The minds behind the vision.
              <span className="block">Every detail intentional.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm text-neutral-300 leading-relaxed">
              Meet the creatives, strategists, and visionaries who bring 23 to life.
              Each member brings a unique perspective, shaping what 23 represents.
            </p>
          </section>

          {/* Members Grid */}
          <section className="mx-auto max-w-6xl px-6 pb-32">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {MEMBERS.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={() => handleMemberClick(member.id)}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 transition-all duration-300 hover:border-neutral-300">
                    {/* Member image */}
                    <div className="aspect-[4/5] bg-gradient-to-br from-neutral-800 to-neutral-900 relative overflow-hidden">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image doesn't exist
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center ${member.image ? 'hidden' : ''}`}>
                        <div className="text-6xl opacity-50">
                          {member.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-3">
                      <div>
                        <h3 className="text-xl font-medium text-white">
                          {member.name}
                        </h3>
                        <p className="text-sm text-neutral-400 mt-1">
                          {member.role}
                        </p>
                      </div>
                      
                      <p className="text-xs text-neutral-300 line-clamp-2">
                        {member.bio}
                      </p>
                      
                      <div className="pt-2 border-t border-neutral-800">
                        <p className="text-xs text-neutral-400">
                          {member.years} years experience
                        </p>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-white">
                        View Profile
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </PageTransition>
  );
}

export default Portfolio;
