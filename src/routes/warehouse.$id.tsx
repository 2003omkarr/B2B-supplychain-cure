import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, PackageCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import { ExpiryPill, SectionHeader, StatusBadge, fmtDateTime } from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/pharma/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/warehouse/$id")({
  head: () => ({
    meta: [
      { title: "Pick List — PharmaConnect Warehouse" },
      { name: "description", content: "Batch-level pick list with rack locations, packing and handover." },
      { property: "og:title", content: "Pick List — PharmaConnect Warehouse" },
      { property: "og:description", content: "Confirm picks against FEFO batches and pack the order." },
    ],
  }),
  component: PickList,
  notFoundComponent: () => (
    <AppShell role="warehouse">
      <SectionHeader title="Order not found" />
      <Button asChild>
        <Link to="/warehouse">Back to queue</Link>
      </Button>
    </AppShell>
  ),
});

function PickList() {
  const { id } = Route.useParams();
  const { state, togglePicked, advanceOrder } = useStore();
  const navigate = useNavigate();
  const order = state.orders.find((o) => o.id === id);
  if (!order) throw notFound();

  const buyer = state.buyers.find((b) => b.id === order.buyerId);
  const batchOf = (batchId: string) => state.batches.find((b) => b.id === batchId);
  const allPicked = order.lines.every((l) => l.picked);
  const pickedCount = order.lines.filter((l) => l.picked).length;

  return (
    <AppShell role="warehouse">
      <SectionHeader
        title={`Pick list ${order.code}`}
        subtitle={`${buyer?.shopName} · ${buyer?.city} · placed ${fmtDateTime(order.createdAt)}`}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-4">
        <p className="mr-auto text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular">
            {pickedCount}/{order.lines.length}
          </span>{" "}
          lines picked · {order.lines.reduce((s, l) => s + l.qty, 0)} units total
        </p>
        {order.status === "ALLOCATED" ? (
          <Button
            onClick={() => {
              advanceOrder(order.id, "PICKING", "Warehouse Staff");
              toast.success("Picking started");
            }}
          >
            Start picking
          </Button>
        ) : null}
        {order.status === "PICKING" ? (
          <Button
            disabled={!allPicked}
            onClick={() => {
              advanceOrder(order.id, "PACKED", "Warehouse Staff");
              toast.success("Order packed and invoice generated");
            }}
          >
            <PackageCheck className="size-4" />
            {allPicked ? "Complete picking & pack" : "Pick all lines to continue"}
          </Button>
        ) : null}
        {order.status === "PACKED" ? (
          <Button
            onClick={() => {
              navigate({ to: "/dispatch" });
              toast.info("Handed over to the dispatch desk");
            }}
          >
            <Truck className="size-4" /> Send to dispatch desk
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        {order.lines.map((l) => (
          <div
            key={l.productId}
            className={cn(
              "rounded-xl border bg-card p-4 transition-colors",
              l.picked && "border-success/40 bg-success/5",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-semibold">{l.name}</p>
                <p className="text-xs text-muted-foreground">
                  {l.packSize} · pick {l.qty} units
                </p>
              </div>
              <Button
                variant={l.picked ? "secondary" : "outline"}
                size="sm"
                disabled={order.status !== "PICKING"}
                onClick={() => togglePicked(order.id, l.productId)}
              >
                <CheckCircle2 className={cn("size-4", l.picked && "text-success")} />
                {l.picked ? "Picked" : "Mark picked"}
              </Button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {l.allocations.map((a) => {
                const b = batchOf(a.batchId);
                return (
                  <div key={a.batchId} className="rounded-lg border bg-background p-3 text-xs">
                    <p className="font-semibold text-foreground">{a.batchNo}</p>
                    <p className="mt-0.5 text-muted-foreground">
                      Rack {b?.rack ?? "—"} · {b?.warehouse ?? "—"}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold tabular">{a.qty} units</span>
                      <ExpiryPill expiry={a.expiry} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
