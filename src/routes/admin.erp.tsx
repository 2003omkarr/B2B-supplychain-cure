import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { KpiCard, SectionHeader, fmtDateTime } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/admin/erp")({
  head: () => ({
    meta: [
      { title: "ERP Sync — PharmaConnect Admin" },
      { name: "description", content: "Simulated Marg/Tally ERP inventory synchronisation for batch stock." },
      { property: "og:title", content: "ERP Sync — PharmaConnect Admin" },
      { property: "og:description", content: "Pull inbound batches and reconcile quantities from the ERP." },
    ],
  }),
  component: Erp,
});

function Erp() {
  const { state, runErpSync } = useStore();
  const [busy, setBusy] = useState(false);
  const syncLogs = state.audit.filter((a) => a.action === "ERP_SYNC");

  const run = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    const res = runErpSync();
    setBusy(false);
    toast.success(`ERP sync complete — ${res.added} batches added, ${res.updated} updated`);
  };

  return (
    <AppShell role="admin">
      <SectionHeader
        title="ERP sync"
        subtitle="Simulated two-way inventory handshake with the distributor's ERP"
        actions={
          <Button onClick={run} disabled={busy}>
            {busy ? "Syncing…" : "Run sync now"}
          </Button>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Last sync"
          value={state.settings.erpLastSync ? fmtDateTime(state.settings.erpLastSync) : "Never"}
        />
        <KpiCard label="Batches tracked" value={state.batches.length} />
        <KpiCard label="Sync runs logged" value={syncLogs.length} />
      </div>

      <div className="rounded-xl border bg-card">
        <p className="border-b px-4 py-3 font-display text-sm font-semibold">Sync history</p>
        {syncLogs.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No sync has run yet in this demo session.</p>
        ) : (
          <ul className="divide-y">
            {syncLogs.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span>{l.detail}</span>
                <span className="text-xs text-muted-foreground">{fmtDateTime(l.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
