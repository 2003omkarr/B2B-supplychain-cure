import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/pharma/AppShell";
import { KpiCard, SectionHeader } from "@/components/pharma/bits";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/finance/credit")({
  head: () => ({
    meta: [
      { title: "Buyer Credit — PharmaConnect Finance" },
      { name: "description", content: "Credit limits, utilisation and exposure for every pharmacy account." },
      { property: "og:title", content: "Buyer Credit — PharmaConnect Finance" },
      { property: "og:description", content: "Monitor credit utilisation before approving more orders." },
    ],
  }),
  component: Credit,
});

function Credit() {
  const { state } = useStore();
  const limit = state.buyers.reduce((s, b) => s + b.creditLimit, 0);
  const used = state.buyers.reduce((s, b) => s + b.outstanding, 0);

  return (
    <AppShell role="finance">
      <SectionHeader title="Buyer credit" subtitle="Exposure and headroom by pharmacy" />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <KpiCard label="Total credit" value={inr(limit)} />
        <KpiCard label="Utilised" value={inr(used)} tone="warning" />
        <KpiCard label="Headroom" value={inr(Math.max(0, limit - used))} tone="success" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {state.buyers.map((b) => {
          const pct = b.creditLimit ? Math.min(100, Math.round((b.outstanding / b.creditLimit) * 100)) : 0;
          return (
            <div key={b.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display font-semibold">{b.shopName}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.city} · {b.owner}
                  </p>
                </div>
                <p className="tabular text-sm font-semibold">{pct}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={pct > 80 ? "h-full bg-destructive" : pct > 60 ? "h-full bg-warning" : "h-full bg-success"}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground tabular">
                {inr(b.outstanding)} used of {inr(b.creditLimit)}
              </p>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
