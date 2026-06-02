import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import kilcardLogo from "@/assets/KilCard.png";

const NAV = [
  { to: "/", label: "Round" },
  { to: "/history", label: "History" },
];

export function AppShell({ children, fullHeight }: { children: ReactNode; fullHeight?: boolean }) {
  const { location } = useRouterState();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut(auth);
    localStorage.removeItem("kilcard:guest");
    navigate({ to: "/auth" });
  }

  return (
    <div className={fullHeight ? "h-dvh flex flex-col bg-paper text-navy" : "min-h-screen bg-paper text-navy"}>
      <header className="shrink-0 sticky top-0 z-20 border-b border-navy/10 bg-paper/85 backdrop-blur">
        <div className={`mx-auto flex max-w-md items-center justify-between px-6 ${fullHeight ? "py-1" : "py-4"}`}>
          <Link to="/" className="flex items-center">
            <img src={kilcardLogo} alt="Kilcard" className={`${fullHeight ? "h-10" : "h-20"} w-auto mix-blend-multiply`} />
          </Link>
          <nav className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em]">
            {NAV.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "px-3 py-2 transition-colors rounded-lg " +
                    (active
                      ? "bg-navy text-paper"
                      : "text-navy/50 hover:text-navy")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="ml-1 px-3 py-2 text-navy/40 transition-colors hover:text-navy rounded-lg hover:bg-navy/5"
              aria-label="Sign out"
              title="Sign out"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2.5C2 2 1.5 2.5 1.5 3v8c0 .5.5 1 1 1H5M9.5 10.5L12.5 7l-3-3.5M12.5 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </nav>
        </div>
      </header>
      {fullHeight ? (
        <main className="flex-1 min-h-0 mx-auto w-full max-w-md px-4 overflow-hidden">{children}</main>
      ) : (
        <>
          <main className="mx-auto max-w-md px-6 pb-24 pt-8">{children}</main>
          <footer className="mx-auto max-w-md px-6 pb-10 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-navy/30">
            Track · Analyze · Improve
          </footer>
        </>
      )}
    </div>
  );
}