import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
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
type Method = "email" | "phone";
type PhoneStep = "input" | "verify";

function firebaseError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":      return "An account with that email already exists. Try logging in.";
    case "auth/user-not-found":            return "No account found. Check your email or sign up.";
    case "auth/wrong-password":            return "Incorrect password. Try again.";
    case "auth/invalid-credential":        return "Incorrect email or password.";
    case "auth/weak-password":             return "Password must be at least 6 characters.";
    case "auth/invalid-email":             return "Enter a valid email address.";
    case "auth/too-many-requests":         return "Too many attempts. Try again later.";
    case "auth/invalid-phone-number":      return "Enter a valid US phone number.";
    case "auth/invalid-verification-code": return "Incorrect code. Check the text and try again.";
    case "auth/code-expired":              return "Code expired. Request a new one.";
    case "auth/quota-exceeded":            return "SMS quota exceeded. Try again later.";
    case "auth/missing-phone-number":      return "Enter a phone number.";
    case "auth/operation-not-allowed":     return "Phone sign-in is not enabled. Enable it in the Firebase console under Authentication → Sign-in method.";
    case "auth/app-not-authorized":        return "This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.";
    case "auth/captcha-check-failed":      return "reCAPTCHA check failed. Refresh the page and try again.";
    case "auth/invalid-app-credential":    return "reCAPTCHA error. Refresh the page and try again.";
    case "auth/missing-app-credential":    return "reCAPTCHA not ready. Refresh the page and try again.";
    case "auth/billing-not-enabled":       return "Firebase billing is not enabled. Upgrade to the Blaze plan to send SMS.";
    case "auth/network-request-failed":    return "Network error. Check your connection and try again.";
    default:                               return `Error: ${code ?? "unknown"}. Check the browser console for details.`;
  }
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode]     = useState<Mode>("signup");
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // Phone two-step state
  const [phoneStep, setPhoneStep]           = useState<PhoneStep>("input");
  const [code, setCode]                     = useState("");
  const confirmationRef                     = useRef<ConfirmationResult | null>(null);
  const recaptchaRef                        = useRef<RecaptchaVerifier | null>(null);

  function resetPhoneFlow() {
    setPhoneStep("input");
    setCode("");
    confirmationRef.current = null;
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    resetPhoneFlow();
  }

  function switchMethod(m: Method) {
    setMethod(m);
    setError("");
    resetPhoneFlow();
  }

  // ── Email auth ──────────────────────────────────────────────────────────────
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

  // ── Phone — step 1: send SMS code ──────────────────────────────────────────
  async function sendCode() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit US phone number.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      recaptchaRef.current?.clear();
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      const result = await signInWithPhoneNumber(auth, `+1${digits}`, recaptchaRef.current);
      confirmationRef.current = result;
      setPhoneStep("verify");
    } catch (err: any) {
      console.error("Phone auth error:", err.code, err.message);
      setError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  // ── Phone — step 2: verify OTP ─────────────────────────────────────────────
  async function verifyCode() {
    if (!confirmationRef.current) return;
    if (code.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit code from your text message.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await confirmationRef.current.confirm(code.trim());
      navigate({ to: "/" });
    } catch (err: any) {
      setError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  function continueAsGuest() {
    localStorage.setItem("kilcard:guest", "true");
    navigate({ to: "/" });
  }

  // ── Render helpers ──────────────────────────────────────────────────────────
  const isPhone = method === "phone";

  return (
    <div className="flex min-h-screen flex-col bg-paper text-navy">
      {/* Invisible reCAPTCHA mount point */}
      <div id="recaptcha-container" />

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
                onClick={() => switchMode(m)}
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

          {/* Method picker */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
              {mode === "signup" ? "Sign up with" : "Sign in with"}
            </label>
            <div className="flex gap-2">
              {(["email", "phone"] as Method[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMethod(m)}
                  className={
                    "flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors " +
                    (method === m
                      ? "bg-grass text-paper"
                      : "border border-navy/15 text-navy/60 hover:bg-navy/5")
                  }
                >
                  {m === "email" ? "Email" : "Phone"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Email form ── */}
          {!isPhone && (
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
          )}

          {/* ── Phone form ── */}
          {isPhone && phoneStep === "input" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
                  Phone Number
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }}
                  placeholder="(555) 000-0000"
                  className="w-full border border-navy/15 bg-white px-4 py-4 text-sm font-medium text-navy placeholder:text-navy/30 focus:border-grass focus:outline-none"
                />
              </div>
              {error && <p className="text-xs font-medium text-red-600">{error}</p>}
              <button
                type="button"
                disabled={loading}
                onClick={sendCode}
                className="w-full bg-grass py-5 text-sm font-bold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-navy disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Code"}
              </button>
            </div>
          )}

          {/* ── Phone — enter OTP ── */}
          {isPhone && phoneStep === "verify" && (
            <div className="space-y-4">
              <div className="bg-navy/5 px-4 py-3">
                <p className="text-xs font-medium text-navy/70">
                  A 6-digit code was sent to <span className="font-bold text-navy">{phone}</span>.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                  placeholder="000000"
                  className="w-full border border-navy/15 bg-white px-4 py-4 text-center font-mono text-xl font-bold tracking-[0.5em] text-navy placeholder:text-navy/20 focus:border-grass focus:outline-none"
                />
              </div>
              {error && <p className="text-xs font-medium text-red-600">{error}</p>}
              <button
                type="button"
                disabled={loading}
                onClick={verifyCode}
                className="w-full bg-grass py-5 text-sm font-bold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-navy disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={resetPhoneFlow}
                className="w-full py-2 text-xs font-bold uppercase tracking-[0.2em] text-navy/40 hover:text-navy/70"
              >
                ← Change number
              </button>
            </div>
          )}

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
