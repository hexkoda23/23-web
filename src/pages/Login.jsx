import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageTransition from "../components/PageTransition.jsx";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      navigate("/hub");
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
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <section className="mx-auto flex w-full max-w-xl flex-col gap-8 rounded-3xl border border-neutral-800 bg-neutral-950 px-8 py-10 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
              Welcome Back
            </p>
            <h2 className="text-xl font-medium text-white">
              Login to 23
            </h2>
            <p className="text-xs leading-relaxed text-neutral-400">
              Sign in to access your personalized outfit generator, meal planner, and more.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 px-6 py-3 text-xs uppercase tracking-[0.35em] text-white transition hover:border-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-neutral-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-white underline hover:text-neutral-300">
                Sign Up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default Login;
