import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Ban, RefreshCw, Wand2, Printer } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/pharma/AppShell";
import {
  ExpiryPill,
  PaymentBadge,
  SectionHeader,
  StatusBadge,
  fmtDateTime,
} from "@/components/pharma/bits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { available, daysToExpiry, inr, inr2, useStore } from "@/lib/pharma/store";
import type { Allocation } from "@/lib/pharma/types";

export const Route = createFileRoute("/admin/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order Detail — PharmaConnect Admin" },
      { name: "description", content: "FEFO allocation detail, manual batch override and fulfilment control." },
      { property: "og:title", content: "Order Detail — PharmaConnect Admin" },
      { property: "og:description", content: "Inspect allocations and drive the fulfilment workflow." },
    ],
  }),
  component: AdminOrderDetail,
  notFoundComponent: () => (
    <AppShell role="admin">
      <SectionHeader title="Order not found" />
      <Button asChild>
        <Link to="/admin/orders">Back to order desk</Link>
      </Button>
    </AppShell>
  ),
});

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const { state, reallocate, cancelOrder, manualAllocate } = useStore();
  const order = state.orders.find((o) => o.id === id);
  const [overrideFor, setOverrideFor] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, number>>({});
  if (!order) throw notFound();

  const buyer = state.buyers.find((b) => b.id === order.buyerId);
  const openOverride = (productId: string) => {
    const line = order.lines.find((l) => l.productId === productId)!;
    setDraft(Object.fromEntries(line.allocations.map((a) => [a.batchId, a.qty])));
    setOverrideFor(productId);
  };

  const saveOverride = () => {
    if (!overrideFor) return;
    const line = order.lines.find((l) => l.productId === overrideFor)!;
    const allocations: Allocation[] = Object.entries(draft)
      .filter(([, q]) => q > 0)
      .map(([batchId, qty]) => {
        const b = state.batches.find((x) => x.id === batchId)!;
        return { batchId, batchNo: b.batchNo, expiry: b.expiry, qty };
      });
    const total = allocations.reduce((s, a) => s + a.qty, 0);
    if (total > line.qty) {
      toast.error(`Allocated ${total} units but the line only needs ${line.qty}`);
      return;
    }
    manualAllocate(order.id, overrideFor, allocations);
    setOverrideFor(null);
    toast.success("Manual batch allocation saved");
  };

  return (
    <AppShell role="admin">
      <SectionHeader
        title={`Order ${order.code}`}
        subtitle={`${buyer?.shopName} · ${buyer?.city} · placed ${fmtDateTime(order.createdAt)}`}
        actions={
          <>
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reallocate(order.id);
                toast.success("FEFO re-allocation complete");
              }}
              disabled={["DISPATCHED", "DELIVERED", "CANCELLED"].includes(order.status)}
            >
              <RefreshCw className="size-4" /> Re-run FEFO
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => cancelOrder(order.id)}
              disabled={["DISPATCHED", "DELIVERED", "CANCELLED"].includes(order.status)}
            >
              <Ban className="size-4" /> Cancel
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="font-display text-base font-semibold">FEFO allocation</h2>
            <span className="text-xs text-muted-foreground">Fill rate {order.fillRate}%</span>
          </div>
          <div className="divide-y">
            {order.lines.map((l) => {
              const allocated = l.allocations.reduce((s, a) => s + a.qty, 0);
              return (
                <div key={l.productId} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.qty} units required · {allocated} allocated · {inr2(l.unitPrice)} each
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={["DISPATCHED", "DELIVERED", "CANCELLED"].includes(order.status)}
                      onClick={() => openOverride(l.productId)}
                    >
                      <Wand2 className="size-4" /> Override batches
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {l.allocations.length ? (
                      l.allocations.map((a) => (
                        <span
                          key={a.batchId}
                          className="inline-flex items-center gap-2 rounded-lg border bg-secondary/60 px-2 py-1 text-[11px]"
                        >
                          <span className="font-semibold">{a.batchNo}</span>
                          <span className="tabular text-muted-foreground">×{a.qty}</span>
                          <ExpiryPill expiry={a.expiry} />
                          {a.manual ? (
                            <span className="rounded bg-warning/25 px-1 font-semibold text-warning-foreground">
                              manual
                            </span>
                          ) : null}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-destructive">No stock allocated</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-base font-semibold">Summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Taxable</dt>
                <dd className="tabular">{inr2(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST</dt>
                <dd className="tabular">{inr2(order.gstAmount)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 font-display text-lg font-semibold">
                <dt>Total</dt>
                <dd className="tabular">{inr(order.total)}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-muted-foreground">Invoice</dt>
                <dd>{order.invoiceNo ?? "Not generated"}</dd>
              </div>
            </dl>
            {order.notes ? (
              <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                Buyer note: {order.notes}
              </p>
            ) : null}
            <div className="mt-4 border-t pt-4">
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to={`/admin/orders/${order.id}/invoice`} target="_blank">
                  <Printer className="size-4" /> Download GST Invoice
                </Link>
              </Button>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-base font-semibold">Timeline</h2>
            <ol className="mt-3 space-y-3">
              {[...order.timeline].reverse().map((t, i) => (
                <li key={i} className="border-l-2 border-primary/25 pl-3">
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDateTime(t.at)} · {t.by}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <Dialog open={!!overrideFor} onOpenChange={(o) => !o && setOverrideFor(null)}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manual batch override</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {overrideFor
              ? state.batches
                  .filter((b) => b.productId === overrideFor && daysToExpiry(b.expiry) > 0)
                  .sort((a, b) => +new Date(a.expiry) - +new Date(b.expiry))
                  .map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-semibold">{b.batchNo}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.warehouse} · rack {b.rack} · {available(b)} free
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExpiryPill expiry={b.expiry} />
                        <input
                          type="number"
                          min={0}
                          value={draft[b.id] ?? 0}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [b.id]: Math.max(0, Number(e.target.value) || 0) }))
                          }
                          className="w-20 rounded-md border px-2 py-1 text-sm tabular"
                          aria-label={`Quantity from ${b.batchNo}`}
                        />
                      </div>
                    </div>
                  ))
              : null}
          </div>
          <Button onClick={saveOverride}>Save allocation</Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
