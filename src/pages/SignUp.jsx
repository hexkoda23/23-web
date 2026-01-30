import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageTransition from "../components/PageTransition.jsx";

function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);

    if (value.length !== 11) {
      setPhoneError("Phone number must be exactly 11 digits");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (phone.length !== 11) {
      setPhoneError("Phone number must be exactly 11 digits");
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, phone, displayName);
      
      // Check for redirect param
      const searchParams = new URLSearchParams(location.search);
      const redirectPath = searchParams.get('redirect') || '/hub';
      navigate(redirectPath);
    } catch (error) {
      console.error("Sign up error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("Email is already registered. Please login instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen w-full text-white">
        <div className="absolute inset-0">
          <img
            src="/lookbook/4.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 flex items-center justify-center px-6 py-24">
          <section className="w-full max-w-md bg-black/60 backdrop-blur-sm border border-white/20 px-8 py-10">
            <div className="space-y-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-300">Create Account</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">Join 23</h2>
              <p className="text-xs leading-relaxed text-gray-300">
                Create your account to access personalized outfit generation and wardrobe management.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.25em] text-gray-300">Display Name (Optional)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-transparent border border-white/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400 focus:border-white transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.25em] text-gray-300">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-white/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400 focus:border-white transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.25em] text-gray-300">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={11}
                  className="w-full bg-transparent border border-white/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400 focus:border-white transition-colors"
                  placeholder="08012345678"
                />
                {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.25em] text-gray-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-white/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400 focus:border-white transition-colors"
                  placeholder="At least 6 characters"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.25em] text-gray-300">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border border-white/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400 focus:border-white transition-colors"
                  placeholder="Re-enter password"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center border border-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-300">
                Already have an account?{" "}
                <Link to={`/login${location.search}`} className="underline hover:text-white">
                  Login
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

export default SignUp;
