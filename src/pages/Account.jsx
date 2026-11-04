
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import PageTransition from "../components/PageTransition";
import { isStoreOwner } from "../lib/growth-api";

export default function Account() {
  const { currentUser, logout, getUserData } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [scans, setScans] = useState({});

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      const data = await getUserData();
      setUserData(data);
    };
    loadData();
  }, [currentUser, navigate, getUserData]);

  useEffect(() => {
    if (!currentUser) return;
    const loadProfiles = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "digitalProfiles"), where("userId", "==", currentUser.uid)));
        setProfiles(snapshot.docs.map(profile => ({ id: profile.id, ...profile.data() })));
      } catch (error) {
        console.error("Failed to load profiles", error);
      }
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch("/api/profile-scans", { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) setScans((await response.json()).scans);
      } catch { /* Scan totals are optional. */ }
    };
    loadProfiles();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!currentUser) return null;

  return (
    <PageTransition>
      <div className="pt-32 pb-20 min-h-screen bg-white">
        <div className="container mx-auto px-6 max-w-2xl">
          <p className="eyebrow mb-5">Your Twenty3 world</p>
            <h1 className="text-4xl font-bold tracking-tighter uppercase mb-12">My Account</h1>
          
          <div className="bg-gray-50 p-8 rounded-lg mb-8">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Email</label>
                <p className="font-medium">{currentUser.email}</p>
              </div>
              {userData?.displayName && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Name</label>
                  <p className="font-medium">{userData.displayName}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg mb-8">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Your creative profile</h2>
            {profiles.length === 0 ? (
              <>
                <p className="text-gray-600 mb-4">Create the page your 23 code opens, so people who scan your outfit can see your work and hire you.</p>
                <Link to="/identity-forge" className="underline font-medium">Create your profile</Link>
              </>
            ) : (
              <div className="space-y-6">
                {profiles.map(profile => (
                  <div key={profile.id}>
                    <p className="font-medium">{profile.name}</p>
                    {(profile.craft || profile.city) && <p className="text-sm text-gray-500">{[profile.craft, profile.city].filter(Boolean).join(" · ")}</p>}
                    {scans[profile.id] && (
                      <p className="text-sm mt-2"><strong>{scans[profile.id].week}</strong> scans and visits this week · <strong>{scans[profile.id].total}</strong> all time</p>
                    )}
                    <p className="text-sm mt-2 space-x-4">
                      <Link to={`/profile/${profile.id}`} className="underline">View</Link>
                      <Link to={`/identity-forge?edit=${profile.id}`} className="underline">Edit</Link>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isStoreOwner(currentUser) && (
            <>
              <Link to="/admin/growth" className="block border border-gray-300 p-4 mb-3 text-sm">Open the Growth Room →</Link>
              <Link to="/messages" className="block border border-gray-300 p-4 mb-6 text-sm">Read contact messages →</Link>
            </>
          )}
          <button 
            onClick={handleLogout}
            className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
