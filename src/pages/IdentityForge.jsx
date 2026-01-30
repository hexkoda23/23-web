import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { doc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../lib/firebase";
import PageTransition from "../components/PageTransition.jsx";
import * as QRCode from "qrcode";
import { useCart } from "../contexts/CartContext";

function IdentityForge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const storage = getStorage();
  
  // Get product data passed from ProductDetails or fallback from localStorage
  const productData = location.state?.productData || (() => {
    try {
      const raw = localStorage.getItem('pendingCustomization');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const [formData, setFormData] = useState({
    name: "",
    igHandle: "",
    xHandle: "",
    phone: "",
    snapchat: "",
    craftFiles: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedProfileId, setGeneratedProfileId] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e) => {
    if (!currentUser) {
      navigate('/login?redirect=/identity-forge');
      return;
    }
    const files = Array.from(e.target.files);
    try {
      const validFiles = files.filter(f => {
        if (f.size > MAX_FILE_SIZE) {
          alert(`${f.name} is larger than 5MB and will be skipped.`);
          return false;
        }
        return true;
      });
      if (validFiles.length === 0) return;
      setUploading(true);
      const uploaded = await Promise.all(
        validFiles.map(async (file) => {
          const path = `digitalProfiles/${currentUser?.uid || 'anonymous'}/${Date.now()}-${file.name}`;
          const fileRef = ref(storage, path);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          return {
            name: file.name,
            type: file.type,
            url,
            size: file.size,
            storagePath: path
          };
        })
      );
      setFormData(prev => ({
        ...prev,
        craftFiles: [...prev.craftFiles, ...uploaded]
      }));
    } catch (error) {
      alert("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFormData(prev => {
      const newFiles = [...prev.craftFiles];
      newFiles.splice(index, 1);
      return {
        ...prev,
        craftFiles: newFiles
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Please enter at least your name!");
      return;
    }
    if (!currentUser) {
      navigate('/login?redirect=/identity-forge');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a unique profile ID
      // If user is logged in, we can use their ID + timestamp, otherwise random
      const profileRef = collection(db, "digitalProfiles");
      const newProfileRef = await addDoc(profileRef, {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        createdAt: serverTimestamp(),
      });
      
      const profileId = newProfileRef.id;
      const baseUrl = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
      const profileUrl = `${baseUrl}/profile/${profileId}`;
      
      // Generate QR Code
      const qrUrl = await QRCode.toDataURL(profileUrl);
      setQrCodeUrl(qrUrl);
      setGeneratedProfileId(profileId);

      // Update the doc with the QR code and URL
      await setDoc(doc(db, "digitalProfiles", profileId), {
        qrCodeUrl: qrUrl,
        profileUrl: profileUrl
      }, { merge: true });

      // If we have product data, add to cart with the customization
      if (productData) {
        const customizedProduct = {
          ...productData.product,
          customization: {
            type: "Digital Identity",
            profileId: profileId,
            profileUrl: profileUrl,
            name: formData.name
          }
        };
        
        addToCart(customizedProduct, productData.selectedSize, productData.quantity);
        try { localStorage.removeItem('pendingCustomization'); } catch (e) {}
        
        // Wait a bit to show success then redirect
      }
      setTimeout(() => {
        navigate("/checkout");
      }, 2000);

    } catch (error) {
      console.error("Error creating identity:", error);
      alert(`Failed to create identity: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (generatedProfileId && productData) {
     return (
        <PageTransition>
            <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6 max-w-md w-full"
                >
                    <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter">Identity Forged</h2>
                    <p className="text-gray-500">Your digital signature has been created and attached to your order.</p>
                    <div className="bg-white p-4 rounded-lg shadow-lg inline-block">
                        <img src={qrCodeUrl} alt="Identity QR" className="w-48 h-48" />
                    </div>
                    <p className="text-sm text-gray-400">Redirecting to checkout...</p>
                </motion.div>
            </div>
        </PageTransition>
     )
  }

  return (
    <PageTransition>
      <div className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-4">Identity Forge</h1>
            <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
              Create your unique digital signature. This information will be embedded in your 23 custom barcode.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="group relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name / Alias"
                  className="w-full bg-transparent border-b border-gray-200 py-4 text-xl focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative">
                  <input
                    type="text"
                    name="igHandle"
                    value={formData.igHandle}
                    onChange={handleInputChange}
                    placeholder="Instagram Handle"
                    className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                  />
                </div>
                <div className="group relative">
                  <input
                    type="text"
                    name="xHandle"
                    value={formData.xHandle}
                    onChange={handleInputChange}
                    placeholder="X (Twitter) Handle"
                    className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                  />
                </div>
                <div className="group relative">
                  <input
                    type="text"
                    name="snapchat"
                    value={formData.snapchat}
                    onChange={handleInputChange}
                    placeholder="Snapchat ID"
                    className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                  Craft Files (Images/Designs)
                </label>
                <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-8 hover:border-black transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="*/*"
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      {uploading ? "Uploading files..." : "Drop files here or click to upload"}
                    </p>
                    <p className="text-xs text-gray-400">Support for files up to 5MB</p>
                  </div>
                </div>

                {formData.craftFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {formData.craftFiles.map((file, index) => (
                      <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {file.type?.startsWith("image/") ? (
                          <img
                            src={file.url || file.data}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="p-3 text-center">
                            <p className="text-xs font-semibold truncate">{file.name}</p>
                            <p className="text-[10px] text-gray-500">{file.type || "file"}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Forging Identity..." : "Generate Digital Signature"}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

export default IdentityForge;
