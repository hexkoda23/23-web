import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getUserData } from "../utils/userStorage";
import PageTransition from "../components/PageTransition.jsx";

function SlumBookView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    const loadProfile = () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Profile ID format: userId_profile_timestamp_random
      // Example: jlpAbmCER6XiNY1IAJFZdFF3hFy1_profile_1768571896106_5vaxbyb81
      // Firebase UIDs are typically 28 characters, but we'll find "profile" to split
      
      let userId = null;
      let foundProfile = null;

      if (id.includes('_profile_')) {
        // Modern format: userId_profile_timestamp_random
        const profileIndex = id.indexOf('_profile_');
        userId = id.substring(0, profileIndex);
        const fullProfileId = id;
        
        // Try loading from slumBookProfiles collection
        const allProfiles = getUserData(userId, "slumBookProfiles", {});
        foundProfile = allProfiles[fullProfileId];
        
        // If not found, try main profile
        if (!foundProfile) {
          const mainProfile = getUserData(userId, "slumBookProfile", null);
          if (mainProfile && mainProfile.id === fullProfileId) {
            foundProfile = mainProfile;
          }
        }
      } else if (id.includes('_')) {
        // Try to find "profile" anywhere in the ID
        const parts = id.split('_');
        const profileIndex = parts.findIndex(part => part === 'profile' || part.startsWith('profile'));
        
        if (profileIndex > 0) {
          userId = parts.slice(0, profileIndex).join('_');
          const fullProfileId = id;
          
          const allProfiles = getUserData(userId, "slumBookProfiles", {});
          foundProfile = allProfiles[fullProfileId];
          
          if (!foundProfile) {
            const mainProfile = getUserData(userId, "slumBookProfile", null);
            if (mainProfile && (mainProfile.id === fullProfileId || mainProfile.id === id)) {
              foundProfile = mainProfile;
            }
          }
        }
      }
      
      // Fallback: search all localStorage for the profile
      if (!foundProfile) {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('user_') && (key.endsWith('_slumBookProfiles') || key.endsWith('_slumBookProfile'))) {
            const extractedUserId = key.replace('user_', '').replace('_slumBookProfiles', '').replace('_slumBookProfile', '');
            
            if (key.endsWith('_slumBookProfiles')) {
              const allProfiles = getUserData(extractedUserId, "slumBookProfiles", {});
              if (allProfiles[id]) {
                foundProfile = allProfiles[id];
                break;
              }
            } else {
              const mainProfile = getUserData(extractedUserId, "slumBookProfile", null);
              if (mainProfile && (mainProfile.id === id || mainProfile.id?.includes(id) || id.includes(mainProfile.id))) {
                foundProfile = mainProfile;
                break;
              }
            }
          }
        }
      }
      
      if (foundProfile) {
        setProfile(foundProfile);
      }
      
      setLoading(false);
    };
    
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="text-neutral-400">Loading profile...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!profile || !profile.formData) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-center space-y-4 max-w-md mx-auto px-6">
            <div className="text-6xl opacity-50 mb-4">📓</div>
            <h2 className="text-2xl font-medium">Profile not found</h2>
            <p className="text-neutral-400">This profile doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 border border-neutral-700 bg-neutral-900 rounded-full text-sm uppercase tracking-[0.2em] hover:border-white hover:bg-neutral-800 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const { formData } = profile;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-neutral-100">
        <main>
          {/* Hero Header */}
          <section className="mx-auto max-w-5xl px-6 pt-16 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-center"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
                Slum Book 23
              </p>
              <h1 className="text-5xl sm:text-6xl font-medium leading-tight text-neutral-50">
                {formData.name || "Profile"}
              </h1>
              {formData.nickname && (
                <p className="text-xl text-neutral-400">"{formData.nickname}"</p>
              )}
              {formData.bio && (
                <p className="text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed mt-4">
                  {formData.bio.length > 150 ? `${formData.bio.substring(0, 150)}...` : formData.bio}
                </p>
              )}
            </motion.div>
          </section>

          {/* Profile Content */}
          <section className="mx-auto max-w-5xl px-6 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Details */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Contact & Social Card */}
                <div className="border border-neutral-800 rounded-3xl p-8 bg-gradient-to-br from-neutral-950 to-neutral-900 space-y-6 backdrop-blur-sm">
                  <h2 className="text-2xl font-medium text-neutral-50 flex items-center gap-3">
                    <span className="w-1 h-8 bg-white"></span>
                    Contact & Social
                  </h2>
                  
                  <div className="space-y-5">
                    {formData.igHandle && (
                      <motion.a
                        href={`https://instagram.com/${formData.igHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 border border-neutral-800 rounded-xl bg-neutral-950 hover:border-neutral-600 hover:bg-neutral-900 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                          IG
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">
                            Instagram
                          </p>
                          <p className="text-white group-hover:text-pink-400 transition-colors">
                            @{formData.igHandle.replace('@', '')}
                          </p>
                        </div>
                        <span className="text-neutral-600 group-hover:text-neutral-400">→</span>
                      </motion.a>
                    )}

                    {formData.xHandle && (
                      <motion.a
                        href={`https://twitter.com/${formData.xHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 border border-neutral-800 rounded-xl bg-neutral-950 hover:border-neutral-600 hover:bg-neutral-900 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white font-bold border border-neutral-700">
                          X
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">
                            X (Twitter)
                          </p>
                          <p className="text-white group-hover:text-blue-400 transition-colors">
                            @{formData.xHandle.replace('@', '')}
                          </p>
                        </div>
                        <span className="text-neutral-600 group-hover:text-neutral-400">→</span>
                      </motion.a>
                    )}

                    {formData.linkedin && (
                      <motion.a
                        href={formData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 border border-neutral-800 rounded-xl bg-neutral-950 hover:border-neutral-600 hover:bg-neutral-900 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                          in
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">
                            LinkedIn
                          </p>
                          <p className="text-white group-hover:text-blue-400 transition-colors break-all text-sm">
                            {formData.linkedin.replace('https://', '').replace('http://', '')}
                          </p>
                        </div>
                        <span className="text-neutral-600 group-hover:text-neutral-400">→</span>
                      </motion.a>
                    )}

                    {formData.phone && (
                      <motion.a
                        href={`tel:${formData.phone}`}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 border border-neutral-800 rounded-xl bg-neutral-950 hover:border-neutral-600 hover:bg-neutral-900 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white">
                          📞
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">
                            Phone
                          </p>
                          <p className="text-white group-hover:text-green-400 transition-colors">
                            {formData.phone}
                          </p>
                        </div>
                      </motion.a>
                    )}

                    {formData.snapchat && (
                      <div className="flex items-center gap-4 p-4 border border-neutral-800 rounded-xl bg-neutral-950">
                        <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold">
                          SC
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">
                            Snapchat
                          </p>
                          <p className="text-white">{formData.snapchat}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio Card */}
                {formData.bio && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="border border-neutral-800 rounded-3xl p-8 bg-gradient-to-br from-neutral-950 to-neutral-900"
                  >
                    <h2 className="text-2xl font-medium text-neutral-50 mb-6 flex items-center gap-3">
                      <span className="w-1 h-8 bg-white"></span>
                      About
                    </h2>
                    <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {formData.bio}
                    </p>
                  </motion.div>
                )}

                {/* Crush Card */}
                {formData.crush && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="border border-pink-500/30 rounded-3xl p-8 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm"
                  >
                    <h2 className="text-2xl font-medium text-neutral-50 mb-4 flex items-center gap-3">
                      <span className="text-3xl">💕</span>
                      <span>Crush</span>
                    </h2>
                    <p className="text-xl text-pink-300 font-medium">
                      {formData.crush}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Right Column - Craft */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                {formData.craftFiles && formData.craftFiles.length > 0 && (
                  <div className="border border-neutral-800 rounded-3xl p-8 bg-gradient-to-br from-neutral-950 to-neutral-900">
                    <h2 className="text-2xl font-medium text-neutral-50 mb-6 flex items-center gap-3">
                      <span className="w-1 h-8 bg-white"></span>
                      Their Craft
                    </h2>
                    <div className="space-y-4">
                      {formData.craftFiles.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                          className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950 hover:border-neutral-700 transition-colors"
                        >
                          {file.type.startsWith('image/') && (
                            <div className="relative group">
                              <img
                                src={file.data || file.url}
                                alt={file.name}
                                className="w-full h-auto"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="hidden w-full aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900 items-center justify-center">
                                <span className="text-neutral-600">Image</span>
                              </div>
                            </div>
                          )}
                          {file.type.startsWith('video/') && (
                            <video
                              src={file.data || file.url}
                              controls
                              className="w-full h-auto"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {file.type.startsWith('audio/') && (
                            <div className="p-6">
                              <p className="text-sm text-neutral-300 mb-4 font-medium">{file.name}</p>
                              <audio
                                src={file.data || file.url}
                                controls
                                className="w-full"
                              >
                                Your browser does not support the audio tag.
                              </audio>
                            </div>
                          )}
                          <div className="p-4 bg-neutral-900 border-t border-neutral-800">
                            <p className="text-xs text-neutral-400 uppercase tracking-[0.1em]">{file.name}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!formData.craftFiles || formData.craftFiles.length === 0) && (
                  <div className="border border-neutral-800 rounded-3xl p-12 bg-gradient-to-br from-neutral-950 to-neutral-900 text-center">
                    <div className="text-6xl opacity-30 mb-4">🎨</div>
                    <p className="text-neutral-500 text-sm">No craft files shared</p>
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        </main>
      </div>
    </PageTransition>
  );
}

export default SlumBookView;
