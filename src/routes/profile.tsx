import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AppShell } from "@/components/kilcard/AppShell";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — Kilcard" }],
  }),
  component: ProfilePage,
});

function resizeImage(file: File, maxPx = 400): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = url;
  });
}

function ProfilePage() {
  const navigate  = useNavigate();
  const user      = auth.currentUser;
  const fileRef   = useRef<HTMLInputElement>(null);

  const [name,      setName]      = useState(localStorage.getItem("kilcard:profile-name") || user?.displayName || "");
  const [bio,       setBio]       = useState(localStorage.getItem("kilcard:profile-bio")  || "");
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("kilcard:avatar") || user?.photoURL || "");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState("");

  const isGuest = !user && localStorage.getItem("kilcard:guest") === "true";
  const initials = (name || user?.email || "G").slice(0, 1).toUpperCase();

  useEffect(() => {
    if (user?.photoURL && !localStorage.getItem("kilcard:avatar")) {
      setAvatarUrl(user.photoURL);
    }
  }, [user]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError("");
    const dataUrl = await resizeImage(file);
    setAvatarUrl(dataUrl);
    localStorage.setItem("kilcard:avatar", dataUrl);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (user) {
        await updateProfile(user, { displayName: name.trim() || null });
      }
      localStorage.setItem("kilcard:profile-name", name.trim());
      localStorage.setItem("kilcard:profile-bio",  bio);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    localStorage.removeItem("kilcard:guest");
    navigate({ to: "/auth" });
  }

  return (
    <AppShell>
      <div className="animate-reveal space-y-7 pb-4">

        {/* Avatar */}
        <div className="flex flex-col items-center pt-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative"
            aria-label="Change profile picture"
          >
            {/* Circle */}
            <div className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-white shadow-md">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-navy">
                  <span className="font-display text-4xl uppercase text-paper">{initials}</span>
                </div>
              )}
            </div>
            {/* Camera overlay */}
            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-grass shadow-sm ring-2 ring-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          <p className="mt-3 text-[17px] font-semibold text-navy">
            {name || (isGuest ? "Guest" : user?.email?.split("@")[0] || "Your Name")}
          </p>
          {user?.email && (
            <p className="text-[13px] text-navy/40">{user.email}</p>
          )}
          {isGuest && (
            <p className="mt-1 text-[11px] text-navy/35">Signed in as guest</p>
          )}
        </div>

        {/* Edit fields */}
        <div>
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/40">
            Edit Profile
          </p>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/8">
            {/* Name */}
            <div className="flex items-center gap-3 px-4 py-1">
              <label className="w-14 shrink-0 text-[13px] font-semibold text-navy/40">Name</label>
              <input
                type="text"
                value={name}
                maxLength={40}
                onChange={(e) => { setName(e.target.value); setSaved(false); }}
                placeholder="Your name"
                className="flex-1 bg-transparent py-3.5 text-[15px] text-navy placeholder:text-navy/25 focus:outline-none"
              />
            </div>
            <div className="mx-4 h-px bg-navy/8" />
            {/* Bio */}
            <div className="flex gap-3 px-4 py-1">
              <label className="w-14 shrink-0 pt-3.5 text-[13px] font-semibold text-navy/40">Bio</label>
              <textarea
                value={bio}
                maxLength={160}
                rows={3}
                onChange={(e) => { setBio(e.target.value); setSaved(false); }}
                placeholder="Tell us about your game…"
                className="flex-1 resize-none bg-transparent py-3.5 text-[15px] leading-snug text-navy placeholder:text-navy/25 focus:outline-none"
              />
            </div>
          </div>
          {error && <p className="mt-2 px-1 text-[13px] text-red-500">{error}</p>}
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={
            "w-full rounded-2xl py-[15px] text-[15px] font-semibold shadow-sm transition-all active:scale-[0.98] " +
            (saved
              ? "bg-grass/20 text-grass"
              : "bg-grass text-paper hover:shadow-md disabled:opacity-60")
          }
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Profile"}
        </button>

        {/* Account info */}
        {user && (
          <div>
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/40">
              Account
            </p>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/8">
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[13px] font-semibold text-navy/40">Email</span>
                <span className="text-[14px] text-navy">{user.email}</span>
              </div>
              <div className="mx-4 h-px bg-navy/8" />
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[13px] font-semibold text-navy/40">Sign-in method</span>
                <span className="text-[14px] capitalize text-navy">
                  {user.providerData[0]?.providerId === "google.com" ? "Google" : "Email"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-2xl bg-red-500 py-[15px] text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-red-600 active:scale-[0.98]"
        >
          Sign Out
        </button>

      </div>
    </AppShell>
  );
}
