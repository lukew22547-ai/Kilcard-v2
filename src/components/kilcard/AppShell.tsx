import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { signOut } from "firebase/auth";
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

export function AppShell({ children, fullHeight }: { children: ReactNode; fullHeight?: boolean }) {
  const { location } = useRouterState();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut(auth);
    localStorage.removeItem("kilcard:guest");
    navigate({ to: "/auth" });
  }

  return (
    <div className={fullHeight ? "h-dvh flex flex-col bg-paper text-navy" : "min-h-dvh flex flex-col bg-paper text-navy"}>

      {/* Slim header — logo + sign out */}
      <header className="shrink-0 sticky top-0 z-20 border-b border-navy/8 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-2">
          <Link to="/">
            <img src={kilcardLogo} alt="Kilcard" className="h-12 w-auto mix-blend-multiply" />
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold text-navy/40 transition-colors hover:bg-navy/5 hover:text-navy/70"
            title="Sign out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
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

      {/* iOS-style bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-navy/8 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-md">
          {TABS.map((tab) => {
            const active = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-1 flex-col items-center gap-1 py-3 transition-colors"
              >
                <span className={active ? "text-grass" : "text-navy/35"}>
                  {tab.icon(active)}
                </span>
                <span className={
                  "text-[10px] font-semibold " +
                  (active ? "text-grass" : "text-navy/35")
                }>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Safe area spacer for devices with home indicator */}
        <div className="h-safe-bottom" />
      </nav>

    </div>
  );
}
