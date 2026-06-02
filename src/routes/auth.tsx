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
    case "auth/email-already-in-use":   return "An account with that email already exists. Try logging in.";
    case "auth/user-not-found":         return "No account found. Check your email or sign up.";
    case "auth/wrong-password":         return "Incorrect password. Try again.";
    case "auth/invalid-credential":     return "Incorrect email or password.";
    case "auth/weak-password":          return "Password must be at least 6 characters.";
    case "auth/invalid-email":          return "Enter a valid email address.";
    case "auth/too-many-requests":      return "Too many attempts. Try again later.";
    case "auth/network-request-failed":  return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":    return "Sign-in window was closed. Try again.";
    case "auth/popup-blocked":           return "Pop-up was blocked by your browser. Allow pop-ups and try again.";
    case "auth/unauthorized-domain":     return "This domain isn't authorized in Firebase. Add it under Authentication → Settings → Authorized domains.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email under a different sign-in method.";
    default: return "Something went wrong. Please try again.";
  }
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode]         = useState<Mode>("signup");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // ── Email / password ────────────────────────────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      }
      navigate({ to: "/" });
    } catch (err: any) {
      setError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  // ── Social providers ────────────────────────────────────────────────────────
  async function signInWithGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate({ to: "/" });
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(firebaseError(err.code));
      }
    } finally {
      setLoading(false);
    }
  }

  function continueAsGuest() {
    localStorage.setItem("kilcard:guest", "true");
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-navy">
      {/* Header */}
      <header className="shrink-0 border-b border-navy/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
          <Link to="/intro" className="flex items-center">
            <img src={kilcardLogo} alt="Kilcard" className="h-14 w-auto mix-blend-multiply" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-md animate-reveal space-y-8 px-6 pb-12 pt-10">

          {/* Headline */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-grass">
              Kilcard / Account
            </p>
            <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight">
              {mode === "signup" ? "Create Your\nAccount" : "Welcome\nBack"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-navy/60">
              {mode === "signup"
                ? "Save your rounds and stats so you never lose your progress."
                : "Sign in to access your rounds and history."}
            </p>
          </div>

          {/* Sign Up / Log In toggle */}
          <div className="flex">
            {(["signup", "login"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                className={
                  "flex-1 py-3 text-sm font-bold uppercase tracking-[0.25em] transition-colors " +
                  (mode === m
                    ? "bg-navy text-paper"
                    : "border border-navy/15 text-navy/60 hover:bg-navy/5")
                }
              >
                {m === "signup" ? "Sign Up" : "Log In"}
              </button>
            ))}
          </div>

          {/* Google sign-in */}
          <button
            type="button"
            disabled={loading}
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 border border-navy/15 py-4 text-sm font-bold uppercase tracking-[0.2em] text-navy transition-colors hover:bg-navy/5 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-navy/10" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-navy/30">or use email</span>
            <div className="flex-1 border-t border-navy/10" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                className="w-full border border-navy/15 bg-white px-4 py-4 text-sm font-medium text-navy placeholder:text-navy/30 focus:border-grass focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
                Password
              </label>
              <input
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Min. 6 characters"
                className="w-full border border-navy/15 bg-white px-4 py-4 text-sm font-medium text-navy placeholder:text-navy/30 focus:border-grass focus:outline-none"
              />
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-grass py-5 text-sm font-bold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-navy disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-navy/10" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-navy/30">or</span>
            <div className="flex-1 border-t border-navy/10" />
          </div>

          {/* Guest */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full border border-navy/15 py-4 text-sm font-bold uppercase tracking-[0.25em] text-navy/60 transition-colors hover:bg-navy/5"
            >
              Continue as Guest
            </button>
            <p className="text-center text-[10px] leading-relaxed text-navy/40">
              Guest data is stored on this device only and may be lost.
            </p>
          </div>

        </div>
      </main>

      <div className="mx-auto max-w-md px-6 pb-6 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-navy/30">
        Track · Analyze · Improve
      </div>
    </div>
  );
}
