import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { EmptyState, ExpiryPill, KpiCard, SectionHeader, fmtDateTime } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { inr, useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/dispatch/")({
  head: () => ({
    meta: [
      { title: "Dispatch Desk — PharmaConnect" },
      {
        name: "description",
        content: "Ready-to-dispatch orders, vehicle assignment and outbound handover for pharma distribution.",
      },
      { property: "og:title", content: "Dispatch Desk — PharmaConnect" },
      { property: "og:description", content: "Load packed cartons and mark orders dispatched with AWB tracking." },
    ],
  }),
  component: DispatchDesk,
});

function DispatchDesk() {
  const { state, advanceOrder } = useStore();
  const ready = state.orders.filter((o) => o.status === "PACKED");
  const dispatchedToday = state.orders.filter((o) => o.status === "DISPATCHED");
  const buyerOf = (id: string) => state.buyers.find((b) => b.id === id);

  return (
    <AppShell role="dispatch">
      <SectionHeader title="Ready to dispatch" subtitle="Packed orders waiting for vehicle loading and handover" />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Awaiting dispatch" value={ready.length} tone="warning" />
        <KpiCard label="Currently in transit" value={dispatchedToday.length} />
        <KpiCard label="Value on the dock" value={inr(ready.reduce((s, o) => s + o.total, 0))} />
      </div>

      {ready.length === 0 ? (
        <EmptyState title="Nothing on the dock" body="Packed orders from the warehouse will appear here." />
      ) : (
        <div className="space-y-3">
          {ready.map((o) => {
            const b = buyerOf(o.buyerId);
            const coldChain = o.lines.some(
              (l) => state.products.find((p) => p.id === l.productId)?.coldChain,
            );
            return (
              <div key={o.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base font-semibold">{o.code}</p>
                      {o.invoiceNo ? (
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium">
                          {o.invoiceNo}
                        </span>
                      ) : null}
                      {coldChain ? (
                        <span className="rounded-md bg-info/12 px-2 py-0.5 text-[11px] font-semibold text-info">
                          Cold chain
                        </span>
                      ) : null}
                      {o.paymentMode === "COD" ? (
                        <span className="rounded-md bg-warning/20 px-2 py-0.5 text-[11px] font-semibold text-warning-foreground">
                          Collect {inr(o.total)} COD
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {b?.shopName} · {b?.address}, {b?.city} {b?.pincode} · packed {fmtDateTime(o.createdAt)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {o.lines.slice(0, 4).flatMap((l) =>
                        l.allocations.slice(0, 1).map((a) => (
                          <span key={a.batchId} className="text-[11px]">
                            <ExpiryPill expiry={a.expiry} />
                          </span>
                        )),
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {o.lines.length} lines · {o.lines.reduce((s, l) => s + l.qty, 0)} units
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      advanceOrder(o.id, "DISPATCHED", "Dispatch Desk");
                      toast.success(`${o.code} dispatched — buyer notified with tracking`);
                    }}
                  >
                    <Truck className="size-4" /> Mark dispatched
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
