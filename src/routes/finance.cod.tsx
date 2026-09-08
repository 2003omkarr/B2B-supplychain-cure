import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { EmptyState, KpiCard, SectionHeader, StatusBadge, fmtDateTime } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/finance/cod")({
  head: () => ({
    meta: [
      { title: "COD Collections — PharmaConnect Finance" },
      { name: "description", content: "Collect and reconcile cash-on-delivery amounts against delivered orders." },
      { property: "og:title", content: "COD Collections — PharmaConnect Finance" },
      { property: "og:description", content: "Cash reconciliation for COD pharmacy orders." },
    ],
  }),
  component: Cod,
});

function Cod() {
  const { state, collectCod } = useStore();
  const pending = state.orders.filter(
    (o) => o.paymentMode === "COD" && o.paymentStatus === "COD_PENDING" && o.status !== "CANCELLED",
  );
  const collectedTotal = state.codCollections.reduce((s, c) => s + c.amount, 0);

  return (
    <AppShell role="finance">
      <SectionHeader title="COD collections" subtitle="Cash due from delivered and in-transit COD orders" />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <KpiCard label="Pending COD orders" value={pending.length} tone="warning" />
        <KpiCard label="Cash due" value={inr(pending.reduce((s, o) => s + o.total, 0))} tone="warning" />
        <KpiCard label="Collected so far" value={inr(collectedTotal)} tone="success" />
      </div>

      {pending.length === 0 ? (
        <EmptyState title="All COD reconciled" body="No cash-on-delivery order is waiting for collection." />
      ) : (
        <div className="grid gap-3">
          {pending.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
              <div className="min-w-[180px]">
                <p className="font-display font-semibold tabular">{o.code}</p>
                <p className="text-xs text-muted-foreground">
                  {state.buyers.find((b) => b.id === o.buyerId)?.shopName} · {fmtDateTime(o.createdAt)}
                </p>
              </div>
              <StatusBadge status={o.status} />
              <p className="ml-auto font-display text-lg font-semibold tabular">{inr(o.total)}</p>
              <Button
                onClick={() => {
                  collectCod(o.id);
                  toast.success(`Collected ${inr(o.total)} against ${o.code}`);
                }}
              >
                Mark cash collected
              </Button>
            </div>
          ))}
        </div>
      )}

      {state.codCollections.length > 0 ? (
        <div className="mt-6 rounded-xl border bg-card">
          <p className="border-b px-4 py-3 font-display text-sm font-semibold">Collection history</p>
          <ul className="divide-y">
            {state.codCollections.map((c) => (
              <li key={`${c.orderId}-${c.at}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="tabular">{state.orders.find((o) => o.id === c.orderId)?.code ?? c.orderId}</span>
                <span className="text-xs text-muted-foreground">
                  {c.by} · {fmtDateTime(c.at)}
                </span>
                <span className="tabular font-semibold">{inr(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </AppShell>
  );
}
