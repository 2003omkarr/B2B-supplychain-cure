import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/pharma/AppShell";
import { EmptyState, KpiCard, SectionHeader, StatusBadge, fmtDateTime } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/pharma/store";

export const Route = createFileRoute("/warehouse/")({
  head: () => ({
    meta: [
      { title: "Fulfilment Queue — PharmaConnect Warehouse" },
      {
        name: "description",
        content: "Warehouse picking and packing queue with batch locations and FEFO allocations.",
      },
      { property: "og:title", content: "Fulfilment Queue — PharmaConnect Warehouse" },
      { property: "og:description", content: "Pick, pack and hand over orders with batch-level accuracy." },
    ],
  }),
  component: Queue,
});

function Queue() {
  const { state } = useStore();
  const queue = state.orders.filter((o) => ["ALLOCATED", "PICKING", "PACKED"].includes(o.status));
  const buyerName = (id: string) => state.buyers.find((b) => b.id === id)?.shopName ?? id;

  return (
    <AppShell role="warehouse">
      <SectionHeader title="Fulfilment queue" subtitle="Orders allocated by the FEFO engine and waiting on the floor" />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Ready to pick" value={queue.filter((o) => o.status === "ALLOCATED").length} />
        <KpiCard label="Picking in progress" value={queue.filter((o) => o.status === "PICKING").length} tone="warning" />
        <KpiCard label="Packed & awaiting dispatch" value={queue.filter((o) => o.status === "PACKED").length} tone="success" />
      </div>

      {queue.length === 0 ? (
        <EmptyState title="Queue is clear" body="No orders are waiting to be picked or packed right now." />
      ) : (
        <div className="space-y-3">
          {queue.map((o) => {
            const picked = o.lines.filter((l) => l.picked).length;
            return (
              <div key={o.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base font-semibold">{o.code}</p>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {buyerName(o.buyerId)} · {o.lines.length} lines ·{" "}
                      {o.lines.reduce((s, l) => s + l.qty, 0)} units · placed {fmtDateTime(o.createdAt)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary">
                      {picked}/{o.lines.length} lines picked
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/warehouse/$id" params={{ id: o.id }}>
                      Open pick list <ArrowRight className="size-4" />
                    </Link>
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
