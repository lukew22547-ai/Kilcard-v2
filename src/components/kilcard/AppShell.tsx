import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import kilcardLogo from "@/assets/KilCard.png";

const TABS = [
  {
    to: "/",
    label: "Round",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 3"/>
      </svg>
    ),
  },
  {
    to: "/history",
    label: "History",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    to: "/stats",
    label: "Stats",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
  },
  {
    to: "/caddie",
    label: "Caddie AI",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
      </svg>
    ),
  },
] as const;

function ProfileButton() {
  const [avatar, setAvatar] = useState<string>("");
  const { location } = useRouterState();
  const isActive = location.pathname === "/profile";

  useEffect(() => {
    const stored = localStorage.getItem("kilcard:avatar");
    if (stored) { setAvatar(stored); return; }
    const photoURL = auth.currentUser?.photoURL;
    if (photoURL) setAvatar(photoURL);
  }, []);

  const initials = (
    localStorage.getItem("kilcard:profile-name") ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email ||
    "G"
  ).slice(0, 1).toUpperCase();

  return (
    <Link to="/profile" aria-label="Profile">
      <div className={
        "h-9 w-9 overflow-hidden rounded-full ring-2 transition-all " +
        (isActive ? "ring-grass" : "ring-navy/15")
      }>
        {avatar ? (
          <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy">
            <span className="text-[13px] font-bold text-paper">{initials}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function AppShell({ children, fullHeight, compact }: { children: ReactNode; fullHeight?: boolean; compact?: boolean }) {
  const { location } = useRouterState();

  return (
    <div className={fullHeight ? "h-dvh flex flex-col bg-paper text-navy" : "min-h-dvh flex flex-col bg-paper text-navy"}>

      {/* Header — logo left, profile avatar right */}
      <header className="shrink-0 sticky top-0 z-20 border-b border-navy/8 bg-paper/90 backdrop-blur">
        <div className={`mx-auto flex max-w-md items-center justify-between px-5 ${compact ? "py-1" : "py-1"}`}>
          <Link to="/">
            <img
              src={kilcardLogo}
              alt="Kilcard"
              className={`${compact ? "h-8" : "h-16"} w-auto mix-blend-multiply`}
            />
          </Link>
          <ProfileButton />
        </div>
      </header>

      {/* Content */}
      {fullHeight ? (
        <main className="flex-1 min-h-0 mx-auto w-full max-w-md px-4 overflow-hidden">
          {children}
        </main>
      ) : (
        <main className="flex-1 mx-auto w-full max-w-md px-5 pt-6 pb-28">
          {children}
        </main>
      )}

      {/* iOS bottom tab bar — 4 tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-navy/8 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-md">
          {TABS.map((tab) => {
            const active = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-1 flex-col items-center gap-[3px] py-2.5 transition-colors"
              >
                <span className={active ? "text-grass" : "text-navy/30"}>
                  {tab.icon(active)}
                </span>
                <span className={
                  "text-[10px] font-semibold " +
                  (active ? "text-grass" : "text-navy/30")
                }>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="h-safe-bottom" />
      </nav>

    </div>
  );
}
