import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import kilcardLogo from "@/assets/KilCard.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign Up — Kilcard" },
      { name: "description", content: "Create your Kilcard account to save your rounds and stats across devices." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signup" | "login";

function firebaseError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":                    return "An account with that email already exists. Try logging in.";
    case "auth/user-not-found":                          return "No account found. Check your email or sign up.";
    case "auth/wrong-password":                          return "Incorrect password. Try again.";
    case "auth/invalid-credential":                      return "Incorrect email or password.";
    case "auth/weak-password":                           return "Password must be at least 6 characters.";
    case "auth/invalid-email":                           return "Enter a valid email address.";
    case "auth/too-many-requests":                       return "Too many attempts. Try again later.";
    case "auth/network-request-failed":                  return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":                    return "Sign-in window was closed. Try again.";
    case "auth/popup-blocked":                           return "Pop-up was blocked. Allow pop-ups and try again.";
    case "auth/unauthorized-domain":                     return "This domain isn't authorized in Firebase. Add it under Authentication → Settings → Authorized domains.";
    case "auth/account-exists-with-different-credential": return "An account already exists with that email under a different sign-in method.";
    default:                                             return "Something went wrong. Please try again.";
  }
}

function AuthPage() {
  const navigate    = useNavigate();
  const [mode, setMode]         = useState<Mode>("signup");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      mode === "signup"
        ? await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
        : await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      localStorage.setItem("kilcard:intro-seen", "true");
      document.cookie = "kc_intro=1; max-age=31536000; path=/; SameSite=Lax";
      navigate({ to: "/" });
    } catch (err: any) {
      setError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      localStorage.setItem("kilcard:intro-seen", "true");
      document.cookie = "kc_intro=1; max-age=31536000; path=/; SameSite=Lax";
      navigate({ to: "/" });
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") setError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  function continueAsGuest() {
    localStorage.setItem("kilcard:guest", "true");
    localStorage.setItem("kilcard:intro-seen", "true");
    navigate({ to: "/" });
  }

  const inputBase = "w-full bg-transparent px-4 py-[15px] text-[15px] text-navy placeholder:text-navy/30 focus:outline-none";

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-5 pb-10 pt-14 text-navy">

      {/* Logo */}
      <Link to="/intro" className="mb-8">
        <img src={kilcardLogo} alt="Kilcard" className="h-28 w-auto mix-blend-multiply" />
      </Link>

      <div className="w-full max-w-sm animate-reveal">

        {/* Headline */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-[42px] uppercase leading-none tracking-tight">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-[15px] text-navy/50">
            {mode === "signup"
              ? "Save your rounds across all your devices."
              : "Sign in to access your rounds and stats."}
          </p>
        </div>

        {/* Segmented control — iOS style */}
        <div className="mb-6 flex rounded-[14px] bg-navy/10 p-[3px]">
          {(["signup", "login"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); }}
              className={
                "flex-1 rounded-[11px] py-2 text-[13px] font-semibold transition-all duration-200 " +
                (mode === m
                  ? "bg-white text-navy shadow-sm"
                  : "text-navy/40 hover:text-navy/60")
              }
            >
              {m === "signup" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </div>

        {/* Google button */}
        <button
          type="button"
          disabled={loading}
          onClick={signInWithGoogle}
          className="mb-5 flex w-full items-center justify-center gap-[10px] rounded-2xl border border-navy/10 bg-white py-[15px] text-[15px] font-semibold text-navy shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-navy/10" />
          <span className="text-[12px] font-medium text-navy/30">or</span>
          <div className="h-px flex-1 bg-navy/10" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} noValidate className="space-y-3">

          {/* Grouped inputs — iOS settings style */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/10">
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="Email address"
              className={inputBase}
            />
            <div className="mx-4 h-px bg-navy/8" />
            <input
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Password (min. 6 characters)"
              className={inputBase}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="px-1 text-[13px] text-red-500">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-grass py-[15px] text-[15px] font-semibold text-paper shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Log In"}
          </button>
        </form>

        {/* Guest */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={continueAsGuest}
            className="text-[14px] font-medium text-navy/40 transition-colors hover:text-navy/70"
          >
            Continue as guest
          </button>
          <p className="mt-1 text-[11px] text-navy/25">
            Guest data is stored on this device only.
          </p>
        </div>

      </div>
    </div>
  );
}
