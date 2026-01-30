import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageTransition from "../components/PageTransition.jsx";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      
      navigate(redirectPath);
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("Failed to login. Please try again.");
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
            src="/lookbook/1.jpg"
            alt="Background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 flex items-center justify-center px-6 py-24">
          <section className="w-full max-w-md bg-black/60 backdrop-blur-sm border border-white/20 px-8 py-10">
            <div className="space-y-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-300">Welcome Back</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">Login</h2>
              <p className="text-xs leading-relaxed text-gray-300">
                Sign in to access your personalized outfit generator and wardrobe management.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                <label className="text-xs uppercase tracking-[0.25em] text-gray-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-white/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400 focus:border-white transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center border border-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-300">
                Don't have an account?{" "}
                <Link to={`/signup${location.search}`} className="underline hover:text-white">
                  Sign Up
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

export default Login;
