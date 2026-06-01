import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Round" },
  { to: "/history", label: "History" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  return (
    <div className="min-h-screen bg-paper text-navy">
      <header className="sticky top-0 z-20 border-b border-navy/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center bg-navy">
              <span className="size-3 bg-grass" />
            </span>
            <span className="font-display text-2xl leading-none">KILCARD</span>
          </Link>
          <nav className="flex gap-1 text-[10px] font-bold uppercase tracking-[0.2em]">
            {NAV.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "px-3 py-2 transition-colors " +
                    (active
                      ? "bg-navy text-paper"
                      : "text-navy/50 hover:text-navy")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-md px-6 pb-24 pt-8">{children}</main>
      <footer className="mx-auto max-w-md px-6 pb-10 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-navy/30">
        Track · Analyze · Improve
      </footer>
    </div>
  );
}