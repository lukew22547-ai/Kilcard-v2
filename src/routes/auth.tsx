import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
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

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhone(e.target.value));
  }

  function validate() {
    if (method === "email") {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Enter a valid email address.";
      }
    } else {
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10) return "Enter a valid 10-digit US phone number.";
    }
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // Persist identity — replace with real auth (Firebase, Supabase, etc.)
    const identifier = method === "email" ? email.trim().toLowerCase() : phone.replace(/\D/g, "");
    const userKey = `kilcard:user:${identifier}`;

    if (mode === "signup") {
      if (localStorage.getItem(userKey)) {
        setError("An account with that " + (method === "email" ? "email" : "phone number") + " already exists. Try logging in.");
        setLoading(false);
        return;
      }
      localStorage.setItem(userKey, JSON.stringify({ identifier, method, createdAt: Date.now() }));
    } else {
      if (!localStorage.getItem(userKey)) {
        setError("No account found. Check your details or sign up.");
        setLoading(false);
        return;
      }
    }

    localStorage.setItem("kilcard:session", identifier);
    navigate({ to: "/" });
  }

  function continueAsGuest() {
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
            <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight text-balance">
              {mode === "signup" ? "Create Your\nAccount" : "Welcome\nBack"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-navy/60">
              {mode === "signup"
                ? "Save your rounds and stats so you never lose your progress."
                : "Sign in to access your rounds and history."}
            </p>
          </div>

          {/* Mode toggle */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Method picker */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
                Sign {mode === "signup" ? "up" : "in"} with
              </label>
              <div className="flex gap-2">
                {(["email", "phone"] as Method[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMethod(m); setError(""); }}
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

            {/* Identifier field */}
            {method === "email" ? (
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
            ) : (
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
                  Phone Number
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 000-0000"
                  className="w-full border border-navy/15 bg-white px-4 py-4 text-sm font-medium text-navy placeholder:text-navy/30 focus:border-grass focus:outline-none"
                />
              </div>
            )}

            {/* Password */}
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

            {/* Error */}
            {error && (
              <p className="text-xs font-medium text-red-600">{error}</p>
            )}

            {/* Submit */}
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

          {/* Guest option */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full border border-navy/15 py-4 text-sm font-bold uppercase tracking-[0.25em] text-navy/60 transition-colors hover:bg-navy/5"
            >
              Continue as Guest
            </button>
            <p className="text-center text-[10px] leading-relaxed text-navy/40">
              Guest data is stored locally on this device only.
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
