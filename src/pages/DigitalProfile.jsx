import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";

export default function DigitalProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "digitalProfiles", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setError("Profile not found");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse tracking-widest uppercase text-sm">Loading Identity...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-gray-400">{error || "Identity not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
        {/* Header / Banner */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
            {profile.craftFiles && profile.craftFiles.length > 0 && (profile.craftFiles[0].url || profile.craftFiles[0].data) ? (
              <img 
                src={profile.craftFiles[0].url || profile.craftFiles[0].data} 
                alt="Cover" 
                className="w-full h-full object-cover opacity-50 blur-sm scale-105"
              />
            ) : (
                <div className="w-full h-full bg-neutral-900" />
            )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
          
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
             <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
             >
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase mb-2">
                    {profile.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm md:text-base tracking-widest text-gray-400 uppercase">
                    <span>Verified Identity</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    <span>23 Exclusive</span>
                </div>
             </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                
                {/* Details Column */}
                <div className="space-y-12">
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 border-b border-gray-800 pb-2">
                            Social Coordinates
                        </h2>
                        <div className="space-y-6">
                            {profile.igHandle && (
                                <div className="group flex items-center justify-between">
                                    <span className="text-gray-400">Instagram</span>
                                    <a
                                      href={`https://instagram.com/${profile.igHandle.replace('@', '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xl font-medium group-hover:text-gray-300 transition-colors"
                                    >
                                      @{profile.igHandle.replace('@', '')}
                                    </a>
                                </div>
                            )}
                            {profile.xHandle && (
                                <div className="group flex items-center justify-between">
                                    <span className="text-gray-400">X (Twitter)</span>
                                    <a
                                      href={`https://x.com/${profile.xHandle.replace('@', '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xl font-medium group-hover:text-gray-300 transition-colors"
                                    >
                                      @{profile.xHandle.replace('@', '')}
                                    </a>
                                </div>
                            )}
                            {profile.tiktok && (
                                <div className="group flex items-center justify-between">
                                    <span className="text-gray-400">TikTok</span>
                                    <a
                                      href={`https://www.tiktok.com/@${profile.tiktok.replace('@', '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xl font-medium group-hover:text-gray-300 transition-colors"
                                    >
                                      @{profile.tiktok.replace('@', '')}
                                    </a>
                                </div>
                            )}
                            {profile.snapchat && (
                                <div className="group flex items-center justify-between">
                                    <span className="text-gray-400">Snapchat</span>
                                    <a
                                      href={`https://www.snapchat.com/add/${profile.snapchat.replace('@', '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xl font-medium group-hover:text-gray-300 transition-colors"
                                    >
                                      {profile.snapchat}
                                    </a>
                                </div>
                            )}
                             {profile.phone && (
                                <div className="group flex items-center justify-between">
                                    <span className="text-gray-400">Contact</span>
                                    <span className="text-xl font-medium group-hover:text-gray-300 transition-colors blur-[2px] hover:blur-none cursor-pointer">
                                        {profile.phone}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>

                    {profile.qrCodeUrl && (
                        <section>
                             <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 border-b border-gray-800 pb-2">
                                Digital Signature
                            </h2>
                            <div className="bg-white p-4 inline-block rounded-lg">
                                {profile.profileUrl ? (
                                  <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer">
                                    <img src={profile.qrCodeUrl} alt="QR Code" className="w-32 h-32 md:w-48 md:h-48" />
                                  </a>
                                ) : (
                                    <img src={profile.qrCodeUrl} alt="QR Code" className="w-32 h-32 md:w-48 md:h-48" />
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* Gallery Column */}
                <div className="space-y-8">
                     <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 border-b border-gray-800 pb-2">
                            Crafted Assets
                    </h2>
                    {profile.craftFiles && profile.craftFiles.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {profile.craftFiles.map((file, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="aspect-square bg-neutral-900 rounded-lg overflow-hidden border border-gray-800"
                                >
                                    <img 
                                        src={file.data} 
                                        alt={`Asset ${idx}`} 
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center border border-gray-800 border-dashed rounded-lg text-gray-600">
                            No assets uploaded
                        </div>
                    )}
                </div>

            </div>
        </div>
      </div>
    </PageTransition>
  );
}
