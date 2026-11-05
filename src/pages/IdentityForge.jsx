import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, setDoc, updateDoc, deleteField, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { uploadFileCloudinary } from "../lib/uploader";
import PageTransition from "../components/PageTransition.jsx";
import * as QRCode from "qrcode";
import { useCart } from "../contexts/CartContext";
import { CRAFTS, isSong, profileFields } from "../../server/profile-model";
import SignatureCode from "../components/SignatureCode";

function IdentityForge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const editId = new URLSearchParams(location.search).get("edit");
  
  // Get product data passed from ProductDetails or fallback from localStorage
  const productData = editId ? null : location.state?.productData || (() => {
    try {
      const raw = localStorage.getItem('pendingCustomization');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const [formData, setFormData] = useState({
    name: "",
    craft: "",
    city: "",
    bio: "",
    openForWork: true,
    wantsFeature: false,
    workContact: "",
    igHandle: "",
    xHandle: "",
    phone: "",
    showPhone: false,
    snapchat: "",
    tiktok: "",
    website: "",
    craftFiles: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedProfileId, setGeneratedProfileId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_SONG_SIZE = 15 * 1024 * 1024;
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!editId || !currentUser) return;
    getDoc(doc(db, "digitalProfiles", editId))
      .then(snapshot => {
        if (!snapshot.exists() || snapshot.data().userId !== currentUser.uid) {
          navigate("/account");
          return;
        }
        setFormData(prev => ({ ...prev, ...profileFields(snapshot.data()) }));
      })
      .catch(() => navigate("/account"));
  }, [editId, currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
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
        const limit = isSong(f) ? MAX_SONG_SIZE : MAX_FILE_SIZE;
        if (f.size > limit) {
          alert(`${f.name} is larger than ${limit / 1024 / 1024}MB and will be skipped.`);
          return false;
        }
        return true;
      });
      if (validFiles.length === 0) return;
      setUploading(true);
      const placeholders = validFiles.map(f => ({
        name: f.name,
        type: f.type,
        url: URL.createObjectURL(f),
        size: f.size,
        storagePath: "",
        status: "uploading"
      }));
      setFormData(prev => ({
        ...prev,
        craftFiles: [...prev.craftFiles, ...placeholders]
      }));
      const useCloudinary = Boolean(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const uploaded = [];
      for (const file of validFiles) {
        if (useCloudinary) {
          try {
            setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));
            const res = await uploadFileCloudinary(file, currentUser.uid);
            uploaded.push({
              name: file.name,
              type: file.type,
              url: res.url,
              size: file.size,
              storagePath: res.publicId
            });
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
            setFormData(prev => ({
              ...prev,
              craftFiles: prev.craftFiles.map(cf => {
                if (cf.name === file.name && cf.size === file.size && cf.status === "uploading") {
                  return { ...cf, url: res.url, storagePath: res.publicId, status: "done" };
                }
                return cf;
              })
            }));
          } catch (err) {
            setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
            setFormData(prev => ({
              ...prev,
              craftFiles: prev.craftFiles.map(cf => {
                if (cf.name === file.name && cf.size === file.size && cf.status === "uploading") {
                  return { ...cf, status: "error" };
                }
                return cf;
              })
            }));
            alert(`Upload failed (Cloudinary) for ${file.name}: ${err.message || err}`);
          }
        } else {
          const path = `digitalProfiles/${currentUser?.uid || 'anonymous'}/${Date.now()}-${file.name}`;
          const fileRef = ref(storage, path);
          await new Promise((resolve, reject) => {
            const task = uploadBytesResumable(fileRef, file, { contentType: file.type || undefined });
            const timeoutMs = 20000;
            const timeoutId = setTimeout(() => {
              try { task.cancel(); } catch (e) {}
              setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
              setFormData(prev => ({
                ...prev,
                craftFiles: prev.craftFiles.map(cf => {
                  if (cf.name === file.name && cf.size === file.size && cf.status === "uploading") {
                    return { ...cf, status: "error" };
                  }
                  return cf;
                })
              }));
              alert(`Upload timed out for ${file.name}. Please verify you are logged in and Firebase Storage rules allow writes.`);
              reject(new Error("upload-timeout"));
            }, timeoutMs);
            task.on(
              "state_changed",
              (snap) => {
                const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                setUploadProgress(prev => ({ ...prev, [file.name]: pct }));
              },
              (err) => {
                clearTimeout(timeoutId);
                setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
                setFormData(prev => ({
                  ...prev,
                  craftFiles: prev.craftFiles.map(cf => {
                    if (cf.name === file.name && cf.size === file.size && cf.status === "uploading") {
                      return { ...cf, status: "error" };
                    }
                    return cf;
                  })
                }));
                alert(`Upload failed for ${file.name}: ${err.code || ''} ${err.message || ''}`);
                reject(err);
              },
              async () => {
                try {
                  clearTimeout(timeoutId);
                  const url = await getDownloadURL(fileRef);
                  uploaded.push({
                    name: file.name,
                    type: file.type,
                    url,
                    size: file.size,
                    storagePath: path
                  });
                  setFormData(prev => ({
                    ...prev,
                    craftFiles: prev.craftFiles.map(cf => {
                      if (cf.name === file.name && cf.size === file.size && cf.status === "uploading") {
                        return { ...cf, url, storagePath: path, status: "done" };
                      }
                      return cf;
                    })
                  }));
                  resolve();
                } catch (e) {
                  reject(e);
                }
              }
            );
          });
        }
      }
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
      if (editId) {
        await updateDoc(doc(db, "digitalProfiles", editId), { ...profileFields(formData), userEmail: deleteField() });
        navigate("/account");
        return;
      }

      // Create a unique profile ID
      // If user is logged in, we can use their ID + timestamp, otherwise random
      const profileRef = collection(db, "digitalProfiles");
      const newProfileRef = await addDoc(profileRef, {
        ...profileFields(formData),
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      
      const profileId = newProfileRef.id;
      const baseUrl = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
      const profileUrl = `${baseUrl}/profile/${profileId}`;
      
      // Generate QR Code
      const qrUrl = await QRCode.toDataURL(profileUrl);
      setGeneratedProfileId(profileId);

      // Update the doc with the QR code and URL
      await setDoc(doc(db, "digitalProfiles", profileId), {
        qrCodeUrl: qrUrl,
        profileUrl: profileUrl,
        website: formData.website || ""
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
      // With a product, the success screen stays up so they can save their signature first.
      if (!productData) setTimeout(() => navigate("/account"), 2000);

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
                    <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center gap-4">
                        <SignatureCode profile={{ id: generatedProfileId, name: formData.name, craft: formData.craft, city: formData.city, profileUrl: `${import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin}/profile/${generatedProfileId}` }} imageClass="w-48 h-48" buttonClass="border border-black px-4 py-2 text-xs uppercase tracking-widest" />
                    </div>
                    <p className="text-sm text-gray-500">You can also find it any time in My account.</p>
                    <button type="button" onClick={() => navigate("/checkout")} className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest">Continue to checkout</button>
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
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-4">{editId ? "Edit your profile" : "Your creative profile"}</h1>
            <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
              Tell people who you are and what you make. This is the public page your 23 code opens, so only add what you want strangers to see.
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
                    name="craft"
                    list="craft-options"
                    value={formData.craft}
                    onChange={handleInputChange}
                    placeholder="Your craft (e.g. Photographer)"
                    className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                  />
                  <datalist id="craft-options">
                    {CRAFTS.map(craft => <option key={craft} value={craft} />)}
                  </datalist>
                </div>
                <div className="group relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="group relative">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={200}
                  rows={2}
                  placeholder="One line about your work"
                  className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300 resize-none"
                />
              </div>

              <div className="group relative">
                <input
                  type="text"
                  name="workContact"
                  value={formData.workContact}
                  onChange={handleInputChange}
                  placeholder="WhatsApp number, email or link for work"
                  className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                />
                <p className="text-xs text-gray-400 mt-2">Public. This powers your Work with me button. Leave it blank to use your Instagram.</p>
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-600">
                <input type="checkbox" name="openForWork" checked={formData.openForWork} onChange={handleInputChange} />
                I'm open for work
              </label>

              <label className="flex items-center gap-3 text-sm text-gray-600">
                <input type="checkbox" name="wantsFeature" checked={formData.wantsFeature} onChange={handleInputChange} />
                Feature me in the Twenty3 community (we review every request)
              </label>

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
                  <label className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <input type="checkbox" name="showPhone" checked={formData.showPhone} onChange={handleInputChange} />
                    Show on my public profile (not saved otherwise)
                  </label>
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
              
              <div className="group relative">
                <input
                  type="text"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  placeholder="TikTok Handle"
                  className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                />
              </div>
              
              <div className="group relative">
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Website (https://...)"
                  className="w-full bg-transparent border-b border-gray-200 py-4 focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                  Craft Files (Images, Designs, Songs)
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
                    <p className="text-xs text-gray-400">Images and designs up to 5MB, songs up to 15MB</p>
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
                        {uploadProgress[file.name] != null && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">
                            {uploadProgress[file.name]}%
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
              {isSubmitting ? "Saving..." : editId ? "Save changes" : "Generate Digital Signature"}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

export default IdentityForge;
