import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/kilcard/AppShell";
import { activatePro } from "@/lib/kilcard/pro";
import { verifyStripeSession } from "@/lib/api/verify-stripe";

export const Route = createFileRoute("/pro")({
  validateSearch: (s: Record<string, unknown>) => ({
    session: typeof s.session === "string" ? s.session : "",
  }),
  component: ProActivatePage,
});

function ProActivatePage() {
  const navigate = useNavigate();
  const { session } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!session) {
      setStatus("error");
      return;
    }
    verifyStripeSession({ data: { sessionId: session } })
      .then(({ valid }) => {
        if (valid) {
          activatePro();
          setStatus("success");
          setTimeout(() => navigate({ to: "/" }), 2500);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        {status === "loading" && (
          <>
            <div className="mb-4 size-12 animate-spin rounded-full border-4 border-navy/10 border-t-grass" />
            <p className="font-display text-2xl">Verifying your payment…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-grass text-3xl text-paper">
              ✓
            </div>
            <p className="font-display text-3xl">AI Caddie Unlocked</p>
            <p className="mt-2 text-sm text-navy/60">Redirecting you home…</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="font-display text-3xl">Something went wrong</p>
            <p className="mt-2 text-sm text-navy/60">
              Payment not found or already used. Contact support if you were charged.
            </p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="mt-6 bg-navy px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-paper hover:bg-grass rounded-xl"
            >
              Back Home
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
