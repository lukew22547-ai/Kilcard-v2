import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/kilcard/AppShell";

export const Route = createFileRoute("/caddie")({
  head: () => ({
    meta: [
      { title: "Caddie AI — Kilcard" },
    ],
  }),
  component: CaddiePage,
});

function CaddiePage() {
  return (
    <AppShell>
      <div className="animate-reveal flex flex-col items-center pt-10 text-center">

        {/* Icon */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-navy shadow-md">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
          </svg>
        </div>

        {/* Text */}
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-grass">
          Coming Soon
        </p>
        <h1 className="font-display text-[42px] uppercase leading-none tracking-tight">
          Caddie AI
        </h1>
        <p className="mt-3 text-[15px] text-navy/50 leading-relaxed max-w-[260px]">
          Your personal AI coach is under maintenance and will be available soon.
        </p>

        {/* Status badge */}
        <div className="mt-8 flex items-center gap-2 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-navy/8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grass opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-grass" />
          </span>
          <p className="text-[13px] font-semibold text-navy/70">Under Maintenance</p>
        </div>

        <p className="mt-6 text-[13px] text-navy/30">
          We're working hard to bring this to you.
        </p>

      </div>
    </AppShell>
  );
}
