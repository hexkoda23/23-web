import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { getUserData, setUserData } from "../utils/userStorage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import PageTransition from "../components/PageTransition.jsx";
import * as QRCode from "qrcode";

function SlumBook() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    igHandle: "",
    xHandle: "",
    linkedin: "",
    phone: "",
    snapchat: "",
    bio: "",
    crush: "",
    craftFiles: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [profileId, setProfileId] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    const userId = currentUser.uid;
    
    // Check if there's a saved profile (user-specific)
    const savedProfile = getUserData(userId, "slumBookProfile", null);
    if (savedProfile) {
      setFormData(savedProfile.formData);
      setProfileId(savedProfile.id);
      setQrCodeUrl(savedProfile.qrCodeUrl);
      setIsEditing(false);
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newFiles = await Promise.all(
      files.map(async (file) => {
        // Convert file to base64 for storage
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        return {
          name: file.name,
          type: file.type,
          data: base64, // Store as base64 instead of blob URL
          size: file.size
        };
      })
    );
    
    setFormData(prev => ({
      ...prev,
      craftFiles: [...prev.craftFiles, ...newFiles]
    }));
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

  const generateQRCode = async () => {
    if (!formData.name) {
      alert("Please enter at least your name!");
      return;
    }

    if (!currentUser) {
      alert("Please login to generate a QR code!");
      return;
    }

    const userId = currentUser.uid;
    
    // Generate unique profile ID (without user ID first, we'll add it later)
    const baseId = profileId || `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create user-specific profile ID
    const userSpecificId = `${userId}_${baseId}`;
    setProfileId(userSpecificId);

    // Create URL for the read-only profile page
    let profileUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // For local development
      profileUrl = `${window.location.origin}/slumbook/${userSpecificId}`;
    } else {
      // For production - ensure proper URL format
      profileUrl = `${window.location.protocol}//${window.location.host}/slumbook/${userSpecificId}`;
    }

    try {
      // Generate QR code
      const qrUrl = await QRCode.toDataURL(profileUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // Higher error correction for better scanning
      });

      setQrCodeUrl(qrUrl);

      // Prepare form data for storage (files are already base64)
      const formDataToSave = {
        ...formData,
        craftFiles: formData.craftFiles.map(file => ({
          name: file.name,
          type: file.type,
          data: file.data, // base64 data
          size: file.size
        }))
      };

      // Save profile data (user-specific)
      const profileData = {
        id: userSpecificId,
        formData: formDataToSave,
        qrCodeUrl: qrUrl,
        profileUrl,
        createdAt: new Date().toISOString()
      };

      // Save user's own profile
      setUserData(userId, "slumBookProfile", profileData);
      
      // Also save to a profiles collection (for read-only access via QR code)
      const allProfiles = getUserData(userId, "slumBookProfiles", {});
      allProfiles[userSpecificId] = profileData;
      setUserData(userId, "slumBookProfiles", allProfiles);

      setIsEditing(false);
      alert("QR Code generated successfully! You can now scan it with any phone camera.");
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Error generating QR code. Please try again.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmitToBrand = async () => {
    if (!qrCodeUrl || !profileId) {
      alert("Please generate a QR code first!");
      return;
    }

    if (!currentUser) {
      alert("Please login to submit your profile!");
      return;
    }

    try {
      setIsSubmitting(true);

      // Verify user is authenticated
      if (!currentUser || !currentUser.uid) {
        alert("You must be logged in to submit. Please login and try again.");
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting with user:", currentUser.uid, "Email:", currentUser.email);

      // Prepare submission data
      const submissionData = {
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        profileId: profileId,
        profileUrl: `${window.location.origin}/slumbook/${profileId}`,
        formData: {
          name: formData.name,
          nickname: formData.nickname || "",
          igHandle: formData.igHandle || "",
          xHandle: formData.xHandle || "",
          linkedin: formData.linkedin || "",
          phone: formData.phone || "",
          snapchat: formData.snapchat || "",
          bio: formData.bio || "",
          crush: formData.crush || "",
          craftFilesCount: formData.craftFiles.length,
        },
        qrCodeUrl: qrCodeUrl,
        submittedAt: serverTimestamp(),
        status: "pending", // pending, reviewed, approved, collection_created
      };

      console.log("Attempting to save to Firestore...");
      console.log("Collection: slumBookSubmissions");
      console.log("Document ID:", profileId);
      console.log("Data:", submissionData);

      // Save to Firestore collection for brand owner
      // Collection will be created automatically on first write
      await setDoc(doc(db, "slumBookSubmissions", profileId), submissionData);

      console.log("✅ Submission successful! Collection: slumBookSubmissions, Document ID:", profileId);
      
      alert("Your Slum Book has been submitted to 23! We'll review it and may create a collection featuring your work. Thank you!");
    } catch (error) {
      console.error("❌ Error submitting to brand:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Error submitting your profile. Please try again.";
      if (error.code === "permission-denied") {
        errorMessage = `Permission denied (${error.code}). Please check:\n1. Firestore rules are deployed\n2. You are logged in\n3. Rules allow 'create' for authenticated users\n\nCheck browser console for details.`;
        console.error("🔴 PERMISSION DENIED - Check Firestore Rules:");
        console.error("1. Go to Firebase Console → Firestore Database → Rules");
        console.error("2. Make sure 'slumBookSubmissions' collection has: allow create: if request.auth != null;");
        console.error("3. Click 'Publish' to deploy rules");
      } else if (error.code === "unavailable") {
        errorMessage = "Firestore is temporarily unavailable. Please try again in a moment.";
      } else if (error.code === "failed-precondition") {
        errorMessage = "Firestore is not available. Please check your internet connection.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Header */}
          <section className="mx-auto max-w-4xl px-6 pt-12 pb-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">
                Slum Book 23
              </p>
              <h1 className="text-4xl sm:text-5xl font-medium leading-tight text-neutral-50">
                Your digital identity.
                <span className="block">Share your craft with the world.</span>
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Create your profile, generate a QR code, and let others discover your work.
              </p>
            </div>
          </section>

          <div className="mx-auto max-w-4xl px-6 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-6">
                {!isEditing && qrCodeUrl && (
                  <div className="mb-6 p-4 border border-neutral-800 rounded-lg bg-neutral-950">
                    <p className="text-sm text-neutral-400 mb-2">Profile created!</p>
                    <button
                      onClick={handleEdit}
                      className="text-sm text-white underline hover:text-neutral-300"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}

                <div className="space-y-6 border border-neutral-800 rounded-2xl p-6 bg-neutral-950">
                  <h2 className="text-xl font-medium text-neutral-50">
                    Your Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white placeholder:text-neutral-600 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        Nickname
                      </label>
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white placeholder:text-neutral-600 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Your nickname"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        name="igHandle"
                        value={formData.igHandle}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white placeholder:text-neutral-600 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="@yourhandle"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        X (Twitter) Handle
                      </label>
                      <input
                        type="text"
                        name="xHandle"
                        value={formData.xHandle}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white placeholder:text-neutral-600 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="@yourhandle"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white placeholder:text-neutral-600 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white placeholder:text-neutral-600 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="+1234567890"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        Snapchat
                      </label>
                      <input
                        type="text"
                        name="snapchat"
                        value={formData.snapchat}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white placeholder:text-neutral-600 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="yourusername"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white placeholder:text-neutral-600 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        Crush 💕
                      </label>
                      <input
                        type="text"
                        name="crush"
                        value={formData.crush}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white placeholder:text-neutral-600 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Who's your crush? (optional)"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Share who you're crushing on (this will be visible on your profile)
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        Your Craft (Music, Pictures, Videos)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileUpload}
                        disabled={!isEditing}
                        className="w-full border border-neutral-700 bg-neutral-900 px-4 py-2 rounded-lg text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      
                      {formData.craftFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {formData.craftFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border border-neutral-800 rounded bg-neutral-900">
                              <span className="text-sm text-neutral-300 truncate">{file.name}</span>
                              {isEditing && (
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      onClick={generateQRCode}
                      className="w-full px-6 py-3 border border-white bg-white text-black rounded-full text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors font-medium"
                    >
                      Generate QR Code
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code Section */}
              <div className="space-y-6">
                {qrCodeUrl ? (
                  <div className="space-y-6 border border-neutral-800 rounded-2xl p-6 bg-neutral-950">
                    <h2 className="text-xl font-medium text-neutral-50">
                      Your QR Code
                    </h2>
                    
                    <div className="flex justify-center">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-full max-w-xs border border-neutral-700 rounded-lg p-4 bg-white"
                      />
                    </div>

                    <div className="space-y-4 pt-4">
                      <p className="text-sm text-neutral-400 text-center">
                        Scan this code to view your profile. Share it with others to let them discover your work.
                      </p>
                      
                      {/* Display URL for testing */}
                      <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                        <p className="text-xs text-neutral-400 mb-1">Profile URL:</p>
                        <p className="text-xs text-white break-all font-mono">
                          {profileId ? `${window.location.origin}/slumbook/${profileId}` : 'Generate QR code to see URL'}
                        </p>
                        <button
                          onClick={() => {
                            if (profileId) {
                              navigator.clipboard.writeText(`${window.location.origin}/slumbook/${profileId}`);
                              alert("URL copied to clipboard!");
                            }
                          }}
                          className="mt-2 text-xs text-neutral-400 hover:text-white underline"
                        >
                          Copy URL
                        </button>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={handleSubmitToBrand}
                          disabled={isSubmitting}
                          className="w-full px-6 py-3 border border-white bg-white text-black rounded-full text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Submitting..." : "Submit to 23 for Collection"}
                        </button>
                        <p className="text-xs text-neutral-500 text-center">
                          Submit your profile to be considered for a 23 collection featuring your work
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.download = 'slumbook-qrcode.png';
                          link.href = qrCodeUrl;
                          link.click();
                        }}
                        className="w-full px-6 py-3 border border-neutral-700 bg-neutral-900 rounded-full text-sm uppercase tracking-[0.2em] hover:border-white hover:bg-neutral-800 transition-colors"
                      >
                        Download QR Code
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-neutral-800 rounded-2xl p-12 bg-neutral-950 text-center">
                    <div className="text-6xl opacity-50 mb-4">📱</div>
                    <p className="text-neutral-400">
                      Generate a QR code to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}

export default SlumBook;
