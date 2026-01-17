import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageTransition from "../components/PageTransition.jsx";

function SignUp() {
  const navigate = useNavigate();
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
      navigate("/hub");
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
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <section className="mx-auto flex w-full max-w-xl flex-col gap-8 rounded-3xl border border-neutral-800 bg-neutral-950 px-8 py-10 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
              Create Account
            </p>
            <h2 className="text-xl font-medium text-white">
              Join 23
            </h2>
            <p className="text-xs leading-relaxed text-neutral-400">
              Create your account to access personalized outfit generation, meal planning, and more.
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
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white"
                placeholder="Your name"
              />
            </div>

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
                Phone
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                maxLength={11}
                className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white"
                placeholder="08012345678"
              />
              {phoneError && (
                <p className="text-xs text-red-500">{phoneError}</p>
              )}
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
                placeholder="At least 6 characters"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white"
                placeholder="Re-enter password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 px-6 py-3 text-xs uppercase tracking-[0.35em] text-white transition hover:border-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-neutral-400">
              Already have an account?{" "}
              <Link to="/login" className="text-white underline hover:text-neutral-300">
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default SignUp;
