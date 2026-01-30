import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import PageTransition from "../components/PageTransition";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Messages() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
      setLoading(false);
    }, (err) => {
      console.error("Failed to load messages", err);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="pt-32 pb-20 min-h-screen bg-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-8">Contact Messages</h1>
            <p className="text-gray-600 mb-12 leading-relaxed">
              View inquiries and custom requests submitted through the Contact page.
            </p>

            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-gray-500">No messages yet.</div>
            ) : (
              <div className="divide-y divide-gray-200 border border-gray-200">
                {messages.map((m) => (
                  <div key={m.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm uppercase font-bold">{m.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{m.email || "-"}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {m.createdAt?.toDate
                          ? m.createdAt.toDate().toLocaleString()
                          : "-"}
                      </p>
                    </div>
                    <p className="mt-4 text-sm text-gray-800">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
