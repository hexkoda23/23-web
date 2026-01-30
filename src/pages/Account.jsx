
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageTransition from "../components/PageTransition";

export default function Account() {
  const { currentUser, logout, getUserData } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

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
