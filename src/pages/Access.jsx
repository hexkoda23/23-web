import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageTransition from "../components/PageTransition.jsx";

function Access() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // If user is already logged in, redirect to hub
    if (currentUser) {
      navigate("/hub");
    }
  }, [currentUser, navigate]);

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <section className="mx-auto flex w-full max-w-xl flex-col gap-8 rounded-3xl border border-neutral-800 bg-neutral-950 px-8 py-10 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
              Access
            </p>
            <h2 className="text-xl font-medium text-white">
              Not everyone enters 23.
            </h2>
            <p className="text-xs leading-relaxed text-neutral-400">
              Leave a trace. Each entry is remembered. No spam, no noise — just a
              quiet signal when the next chapter opens.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGetStarted}
              className="w-full inline-flex items-center justify-center rounded-full border border-white bg-white text-black px-6 py-3 text-xs uppercase tracking-[0.35em] transition hover:bg-neutral-100"
            >
              Create Account
            </button>
            
            <button
              onClick={handleLogin}
              className="w-full inline-flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 px-6 py-3 text-xs uppercase tracking-[0.35em] text-white transition hover:border-white hover:bg-neutral-800"
            >
              Login
            </button>
          </div>
          
          <p className="text-xs text-center text-neutral-500">
            Create an account to access personalized features
          </p>
        </section>
      </div>
    </PageTransition>
  );
}

export default Access;
